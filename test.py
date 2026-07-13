"""
add_products.py
---------------
Automates adding products to the e-commerce backend.

Usage:
    python add_products.py --base-url http://localhost:4000 --data products.json
    python add_products.py --base-url http://localhost:4000 --data products.json --images-dir ./images

products.json format — a JSON array of product objects:
[
  {
    "name": "Classic Mug",
    "sku": "MUG-001",
    "slug": "classic-mug",
    "description": "A classic ceramic mug",
    "material": "Ceramic",
    "price": 299,
    "original_price": 399,
    "discount": 25,
    "category_id": 1,
    "is_new_arrival": true,
    "is_top_selling": false,
    "is_customizable": false,
    "is_customizable_with_image": false,
    "is_sold_out": false,
    "sizes": [
      { "label": "Small", "price": 249 },
      { "label": "Large", "price": 349 }
    ],
    "images": ["classic-mug-1.jpg", "classic-mug-2.jpg"]   // filenames inside --images-dir
  }
]
"""

import argparse
import json
import logging
import os
import sys
import time
from datetime import datetime
from pathlib import Path

import requests

# ─── Logging setup ────────────────────────────────────────────────────────────

LOG_DIR = Path("logs")
LOG_DIR.mkdir(exist_ok=True)

timestamp = datetime.now().strftime("%Y%m%d_%H%M%S")
log_file = LOG_DIR / f"add_products_{timestamp}.log"

# Root logger — writes to both console and file
logging.basicConfig(
    level=logging.DEBUG,
    format="%(asctime)s  %(levelname)-8s  %(message)s",
    datefmt="%Y-%m-%d %H:%M:%S",
    handlers=[
        logging.FileHandler(log_file, encoding="utf-8"),
        logging.StreamHandler(sys.stdout),
    ],
)

# Separate error-only log file
error_handler = logging.FileHandler(
    LOG_DIR / f"errors_{timestamp}.log", encoding="utf-8"
)
error_handler.setLevel(logging.ERROR)
error_handler.setFormatter(
    logging.Formatter("%(asctime)s  %(levelname)-8s  %(message)s")
)

logger = logging.getLogger(__name__)
logger.addHandler(error_handler)

# ─── API helpers ──────────────────────────────────────────────────────────────

REQUIRED_FIELDS = {"name", "sku", "slug", "price", "category_id", "material"}


def create_product(base_url: str, body: dict, session: requests.Session) -> dict:
    """POST /admin/products — create a product, return the created product dict."""
    url = f"{base_url}/admin/products"
    logger.debug("POST %s  body=%s", url, json.dumps(body, ensure_ascii=False))
    resp = session.post(url, json=body, timeout=30)
    resp.raise_for_status()
    return resp.json()


def upload_image(
    base_url: str, product_id: str | int, image_path: Path, session: requests.Session
) -> dict:
    """POST /admin/products/:id/images — upload a single image file."""
    url = f"{base_url}/admin/products/{product_id}/images"
    logger.debug("Uploading image '%s' → %s", image_path.name, url)
    with image_path.open("rb") as fh:
        files = {"file": (image_path.name, fh, _mime(image_path))}
        resp = session.post(url, files=files, timeout=60)
    resp.raise_for_status()
    return resp.json()


def get_product(
    base_url: str, product_id: str | int, session: requests.Session
) -> dict:
    """GET /admin/products/:id — fetch full product after creation."""
    url = f"{base_url}/admin/products/{product_id}"
    logger.debug("GET %s", url)
    resp = session.get(url, timeout=30)
    resp.raise_for_status()
    return resp.json()


def _mime(path: Path) -> str:
    suffix = path.suffix.lower()
    return {
        ".jpg": "image/jpeg",
        ".jpeg": "image/jpeg",
        ".png": "image/png",
        ".webp": "image/webp",
        ".gif": "image/gif",
    }.get(suffix, "application/octet-stream")


# ─── Validation ───────────────────────────────────────────────────────────────


def validate_product(product: dict, index: int) -> list[str]:
    """Return a list of validation error strings (empty = valid)."""
    errors = []
    missing = REQUIRED_FIELDS - set(product.keys())
    if missing:
        errors.append(f"Missing required fields: {', '.join(sorted(missing))}")
    if "price" in product and not isinstance(product["price"], (int, float)):
        errors.append("'price' must be a number")
    if "category_id" in product and not isinstance(product["category_id"], int):
        errors.append("'category_id' must be an integer")
    sizes = product.get("sizes", [])
    for i, s in enumerate(sizes):
        if not s.get("label") or s.get("price") is None:
            errors.append(f"sizes[{i}] must have 'label' and 'price'")
    return errors


# ─── Core routine ─────────────────────────────────────────────────────────────


def build_body(product: dict) -> dict:
    """Extract only the fields the API expects."""
    return {
        "name": product["name"].strip(),
        "sku": product["sku"].strip(),
        "slug": product["slug"].strip(),
        "description": product.get("description", "").strip(),
        "material": product.get("material", ""),
        "price": float(product["price"]),
        "original_price": (
            float(product["original_price"]) if product.get("original_price") else None
        ),
        "discount": float(product["discount"]) if product.get("discount") else None,
        "category_id": int(product["category_id"]),
        "is_new_arrival": bool(product.get("is_new_arrival", False)),
        "is_top_selling": bool(product.get("is_top_selling", False)),
        "is_customizable": bool(product.get("is_customizable", False)),
        "is_customizable_with_image": bool(
            product.get("is_customizable_with_image", False)
        ),
        "is_sold_out": bool(product.get("is_sold_out", False)),
        "sizes": [
            {"label": s["label"].strip(), "price": float(s["price"])}
            for s in product.get("sizes", [])
            if str(s.get("label", "")).strip() and s.get("price") is not None
        ],
    }


def process_products(
    base_url: str,
    products: list[dict],
    images_dir: Path | None,
    session: requests.Session,
    dry_run: bool = False,
    retry_count: int = 2,
    retry_delay: float = 3.0,
) -> dict:
    """
    Iterate over all products, create each one, upload images, then fetch the full record.
    Returns a summary dict.
    """
    total = len(products)
    succeeded, failed, skipped = [], [], []

    logger.info("=" * 60)
    logger.info("Starting product import  (total=%d, dry_run=%s)", total, dry_run)
    logger.info("=" * 60)

    for idx, product in enumerate(products, start=1):
        name = product.get("name", f"<product #{idx}>")
        logger.info("[%d/%d] Processing: %s", idx, total, name)

        # ── Validate ──────────────────────────────────────────────
        errs = validate_product(product, idx)
        if errs:
            for e in errs:
                logger.error("[%d/%d] Validation error — %s: %s", idx, total, name, e)
            skipped.append({"index": idx, "name": name, "reason": errs})
            continue

        if dry_run:
            logger.info("[%d/%d] DRY RUN — would create: %s", idx, total, name)
            skipped.append({"index": idx, "name": name, "reason": ["dry-run"]})
            continue

        body = build_body(product)

        # ── Create product (with retries) ──────────────────────────
        created = None
        for attempt in range(1, retry_count + 2):
            try:
                created = create_product(base_url, body, session)
                logger.info(
                    "[%d/%d] ✓ Created product id=%s  sku=%s",
                    idx,
                    total,
                    created.get("id"),
                    body["sku"],
                )
                break
            except requests.HTTPError as exc:
                logger.error(
                    "[%d/%d] HTTP %s on createProduct (attempt %d): %s",
                    idx,
                    total,
                    exc.response.status_code,
                    attempt,
                    exc.response.text[:300],
                )
            except requests.RequestException as exc:
                logger.error(
                    "[%d/%d] Network error on createProduct (attempt %d): %s",
                    idx,
                    total,
                    attempt,
                    exc,
                )

            if attempt <= retry_count:
                logger.info("Retrying in %.1fs…", retry_delay)
                time.sleep(retry_delay)
            else:
                logger.error(
                    "[%d/%d] ✗ Giving up on createProduct for: %s", idx, total, name
                )
                failed.append({"index": idx, "name": name, "step": "createProduct"})
                break

        if created is None:
            continue

        product_id = created["id"]

        # ── Upload images ──────────────────────────────────────────
        image_filenames = product.get("images", [])
        if image_filenames and images_dir:
            logger.info(
                "[%d/%d] Uploading %d image(s)…", idx, total, len(image_filenames)
            )
            for fname in image_filenames:
                img_path = images_dir / fname
                if not img_path.exists():
                    logger.warning(
                        "[%d/%d] Image not found, skipping: %s", idx, total, img_path
                    )
                    continue
                for attempt in range(1, retry_count + 2):
                    try:
                        upload_image(base_url, product_id, img_path, session)
                        logger.info("[%d/%d]   ✓ Uploaded: %s", idx, total, fname)
                        break
                    except requests.HTTPError as exc:
                        logger.error(
                            "[%d/%d]   HTTP %s uploading '%s' (attempt %d): %s",
                            idx,
                            total,
                            exc.response.status_code,
                            fname,
                            attempt,
                            exc.response.text[:200],
                        )
                    except requests.RequestException as exc:
                        logger.error(
                            "[%d/%d]   Network error uploading '%s' (attempt %d): %s",
                            idx,
                            total,
                            fname,
                            attempt,
                            exc,
                        )

                    if attempt <= retry_count:
                        time.sleep(retry_delay)
                    else:
                        logger.error(
                            "[%d/%d]   ✗ Failed to upload: %s", idx, total, fname
                        )
        elif image_filenames and not images_dir:
            logger.warning(
                "[%d/%d] Product has images listed but --images-dir not provided; skipping uploads.",
                idx,
                total,
            )

        # ── Fetch full product ─────────────────────────────────────
        try:
            full = get_product(base_url, product_id, session)
            logger.info("[%d/%d] ✓ Fetched full product: id=%s", idx, total, product_id)
            succeeded.append(
                {"index": idx, "name": name, "id": product_id, "product": full}
            )
        except requests.RequestException as exc:
            logger.warning(
                "[%d/%d] Could not fetch full product after creation: %s",
                idx,
                total,
                exc,
            )
            succeeded.append(
                {"index": idx, "name": name, "id": product_id, "product": created}
            )

    # ── Summary ────────────────────────────────────────────────────
    logger.info("=" * 60)
    logger.info(
        "Import complete — succeeded=%d  failed=%d  skipped=%d",
        len(succeeded),
        len(failed),
        len(skipped),
    )
    if failed:
        logger.error("Failed products:")
        for f in failed:
            logger.error("  [%d] %s  (step: %s)", f["index"], f["name"], f["step"])
    if skipped:
        logger.warning("Skipped products:")
        for s in skipped:
            logger.warning("  [%d] %s  — %s", s["index"], s["name"], s["reason"])
    logger.info("Logs written to: %s", log_file)
    logger.info("=" * 60)

    return {"succeeded": succeeded, "failed": failed, "skipped": skipped}


# ─── CLI ──────────────────────────────────────────────────────────────────────


def parse_args() -> argparse.Namespace:
    parser = argparse.ArgumentParser(
        description="Bulk-add products to the e-commerce backend.",
        formatter_class=argparse.RawDescriptionHelpFormatter,
        epilog=__doc__,
    )
    parser.add_argument(
        "--base-url", required=True, help="Backend base URL, e.g. http://localhost:4000"
    )
    parser.add_argument("--data", required=True, help="Path to products JSON file")
    parser.add_argument(
        "--images-dir",
        default=None,
        help="Directory containing image files referenced in the JSON",
    )
    parser.add_argument(
        "--auth-token",
        default=None,
        help="Bearer token for Authorization header (if required)",
    )
    parser.add_argument(
        "--dry-run",
        action="store_true",
        help="Validate and log without making any API calls",
    )
    parser.add_argument(
        "--retry", type=int, default=2, help="Number of retries on failure (default: 2)"
    )
    parser.add_argument(
        "--retry-delay",
        type=float,
        default=3.0,
        help="Seconds between retries (default: 3)",
    )
    parser.add_argument(
        "--output", default=None, help="Optional path to write the result summary JSON"
    )
    return parser.parse_args()


def main() -> None:
    args = parse_args()

    # ── Load JSON data ─────────────────────────────────────────────
    data_path = Path(args.data)
    if not data_path.exists():
        logger.error("Data file not found: %s", data_path)
        sys.exit(1)

    try:
        with data_path.open(encoding="utf-8") as f:
            products = json.load(f)
    except json.JSONDecodeError as exc:
        logger.error("Failed to parse JSON: %s", exc)
        sys.exit(1)

    if not isinstance(products, list):
        logger.error("JSON root must be an array of product objects.")
        sys.exit(1)

    # ── Images directory ───────────────────────────────────────────
    images_dir = Path(args.images_dir) if args.images_dir else None
    if images_dir and not images_dir.is_dir():
        logger.error(
            "--images-dir does not exist or is not a directory: %s", images_dir
        )
        sys.exit(1)

    # ── HTTP session ───────────────────────────────────────────────
    session = requests.Session()
    session.headers.update({"Accept": "application/json"})
    if args.auth_token:
        session.headers.update({"Authorization": f"Bearer {args.auth_token}"})

    # ── Run ────────────────────────────────────────────────────────
    summary = process_products(
        base_url=args.base_url.rstrip("/"),
        products=products,
        images_dir=images_dir,
        session=session,
        dry_run=args.dry_run,
        retry_count=args.retry,
        retry_delay=args.retry_delay,
    )

    # ── Optional output file ───────────────────────────────────────
    if args.output:
        out_path = Path(args.output)
        try:
            with out_path.open("w", encoding="utf-8") as f:
                # Don't dump full product objects into summary to keep it readable
                slim = {
                    "succeeded": [
                        {"index": s["index"], "name": s["name"], "id": s["id"]}
                        for s in summary["succeeded"]
                    ],
                    "failed": summary["failed"],
                    "skipped": summary["skipped"],
                }
                json.dump(slim, f, indent=2, ensure_ascii=False)
            logger.info("Summary written to: %s", out_path)
        except OSError as exc:
            logger.error("Could not write output file: %s", exc)

    # Exit with non-zero code if anything failed
    if summary["failed"]:
        sys.exit(1)


if __name__ == "__main__":
    main()
