"""Sanitize and privately extract the user-supplied cookbook PDFs.

The output under tmp/pdfs is intentionally gitignored. Only factual recipe
titles and source locators derived from this output may enter committed data.
"""

from __future__ import annotations

import hashlib
import json
from pathlib import Path
from typing import Any, Iterable

from pypdf import PdfReader, PdfWriter
from pypdf.generic import ArrayObject, DictionaryObject, IndirectObject, NameObject


DOWNLOADS = Path.home() / "Downloads"
OUTPUT_ROOT = Path("tmp/pdfs")
SANITIZED_ROOT = OUTPUT_ROOT / "sanitized"
TEXT_ROOT = OUTPUT_ROOT / "pages"

SOURCES = (
    {
        "key": "black-butler-cookbook",
        "file": "Black Butler Cookbook.pdf",
        "title": "Black Butler Cookbook",
        "primaryKind": "anime",
        "franchiseHint": "Black Butler",
    },
    {
        "key": "bake-anime",
        "file": "BakeAnime_EmilyJBushman.pdf",
        "title": "Bake Anime",
        "primaryKind": "anime",
        "franchiseHint": "Multiple anime",
    },
    {
        "key": "dr-stone-unofficial-cookbook",
        "file": "1005436242-Dr-stone-Unofficial-Cookbook-Completo-1.pdf",
        "title": "Dr. Stone Unofficial Cookbook",
        "primaryKind": "anime",
        "franchiseHint": "Dr. Stone",
    },
    {
        "key": "unofficial-studio-ghibli-cookbook",
        "file": "982747757-The-Unofficial-Studio-Ghibli-Cookbook-PDF.pdf",
        "title": "The Unofficial Studio Ghibli Cookbook",
        "primaryKind": "film",
        "franchiseHint": "Studio Ghibli",
    },
    {
        "key": "mila-brady-studio-ghibli-cookbook",
        "file": "869850350-Studio-Ghibli-Cookbook-Provides-You-With-Unique-Cooking-Mila-Brady-United-States-2021.pdf",
        "title": "Studio Ghibli Cookbook by Mila Brady",
        "primaryKind": "film",
        "franchiseHint": "Studio Ghibli",
    },
    {
        "key": "avatar-official-cookbook",
        "file": "866351829-Avatar-the-Last-Airbender-Cookbook-Official-Recipes-From-the-Four-Nations-Jenny-Dorsey-1.pdf",
        "title": "Avatar: The Last Airbender Official Cookbook",
        "primaryKind": "animation",
        "franchiseHint": "Avatar: The Last Airbender",
    },
    {
        "key": "lets-make-ramen",
        "file": "813175920-Let-s-Make-Ramen-A-Comic-Book-Cookbook.pdf",
        "title": "Let's Make Ramen!",
        "primaryKind": "anime",
        "franchiseHint": "General ramen reference",
    },
    {
        "key": "anime-chef-cookbook",
        "file": "773500793-An-i-Me-Chef-Cookbook.pdf",
        "title": "The Anime Chef Cookbook",
        "primaryKind": "anime",
        "franchiseHint": "Multiple anime",
    },
    {
        "key": "official-disney-parks-cookbook",
        "file": "749742785-The-Official-Disney-Parks-Cookbook-Pam-Brandon.pdf",
        "title": "The Official Disney Parks Cookbook",
        "primaryKind": "theme_park",
        "franchiseHint": "Disney Parks",
    },
    {
        "key": "stardew-valley-cookbook",
        "file": "707247589-Stardew-Valley-Cookbook.pdf",
        "title": "The Official Stardew Valley Cookbook",
        "primaryKind": "game",
        "franchiseHint": "Stardew Valley",
    },
    {
        "key": "studio-ghibli-recipe-book",
        "file": "694420737-Studio-Ghibli-Recipe-Book.pdf",
        "title": "Studio Ghibli Recipe Book",
        "primaryKind": "film",
        "franchiseHint": "Studio Ghibli",
    },
    {
        "key": "one-piece-pirate-recipes",
        "file": "676869206-One-Piece-Pirate-Recipes-Sanji-2021.pdf",
        "title": "One Piece: Pirate Recipes",
        "primaryKind": "anime",
        "franchiseHint": "One Piece",
    },
    {
        "key": "naruto-anime-recipes",
        "file": "491755417-Naruto-Anime-Recipes-You-Should-Be-Making-Susan-Gray.pdf",
        "title": "Naruto Anime Recipes You Should Be Making",
        "primaryKind": "anime",
        "franchiseHint": "Naruto",
    },
    {
        "key": "food-wars-recipe-compilation",
        "file": "467004013-Food-Wars-Shokugeki-No-Souma-Recipe-pdf.pdf",
        "title": "Food Wars Recipe Compilation",
        "primaryKind": "anime",
        "franchiseHint": "Food Wars! Shokugeki no Soma",
    },
    {
        "key": "ffxv-community-cookbook",
        "file": "352910550-FFXV-Recipe-Cookbook.pdf",
        "title": "Final Fantasy XV Community Cookbook",
        "primaryKind": "game",
        "franchiseHint": "Final Fantasy XV",
    },
)

ROOT_ACTION_KEYS = ("/OpenAction", "/AA")
NAME_ACTION_KEYS = ("/JavaScript", "/EmbeddedFiles")
ANNOTATION_ACTION_KEYS = ("/A", "/AA")
DANGEROUS_ACTION_TYPES = {
    "/JavaScript",
    "/Launch",
    "/SubmitForm",
    "/ImportData",
    "/Rendition",
    "/RichMediaExecute",
}
ACTIVE_ACTION_KEYS = {"/OpenAction", "/AA", "/JavaScript", "/JS"}


def sha256(path: Path) -> str:
    digest = hashlib.sha256()
    with path.open("rb") as stream:
        for chunk in iter(lambda: stream.read(1024 * 1024), b""):
            digest.update(chunk)
    return digest.hexdigest()


def pop_key(mapping: DictionaryObject, key: str) -> bool:
    name = NameObject(key)
    if name not in mapping:
        return False
    mapping.pop(name)
    return True


def find_reachable_active_actions(source: Path) -> list[str]:
    """Report executable actions reachable from the sanitized document catalog."""

    reader = PdfReader(source, strict=False)
    findings: list[str] = []
    visited: set[tuple[int, int] | int] = set()

    def visit(value: Any, location: str) -> None:
        if isinstance(value, IndirectObject):
            identity: tuple[int, int] | int = (value.idnum, value.generation)
            if identity in visited:
                return
            visited.add(identity)
            try:
                visit(value.get_object(), location)
            except Exception:
                return
            return

        if isinstance(value, DictionaryObject):
            identity = id(value)
            if identity in visited:
                return
            visited.add(identity)
            for key, child in value.items():
                key_text = str(key)
                child_location = f"{location}{key_text}"
                if key_text in ACTIVE_ACTION_KEYS:
                    findings.append(child_location)
                    continue
                if key_text == "/S" and str(child) in DANGEROUS_ACTION_TYPES:
                    findings.append(f"{child_location}={child}")
                    continue
                visit(child, child_location)
            return

        if isinstance(value, (ArrayObject, list, tuple)):
            for index, child in enumerate(value):
                visit(child, f"{location}[{index}]")

    visit(reader.trailer["/Root"], "root")
    return findings


def sanitize_pdf(source: Path, destination: Path) -> dict[str, Any]:
    reader = PdfReader(source, strict=False)
    if reader.is_encrypted:
        reader.decrypt("")

    writer = PdfWriter()
    writer.clone_document_from_reader(reader)
    removed: list[str] = []

    root = writer.root_object
    for key in ROOT_ACTION_KEYS:
        if pop_key(root, key):
            removed.append(f"root:{key}")

    names_ref = root.get("/Names")
    if names_ref:
        names = names_ref.get_object()
        for key in NAME_ACTION_KEYS:
            if pop_key(names, key):
                removed.append(f"names:{key}")

    for page_index, page in enumerate(writer.pages, start=1):
        if pop_key(page, "/AA"):
            removed.append(f"page-{page_index}:/AA")
        annotations = page.get("/Annots") or []
        for annotation_index, annotation_ref in enumerate(annotations, start=1):
            annotation = annotation_ref.get_object()
            for key in ANNOTATION_ACTION_KEYS:
                if pop_key(annotation, key):
                    removed.append(
                        f"page-{page_index}:annotation-{annotation_index}:{key}"
                    )

    destination.parent.mkdir(parents=True, exist_ok=True)
    with destination.open("wb") as stream:
        writer.write(stream)

    remaining_active_actions = find_reachable_active_actions(destination)
    if remaining_active_actions:
        raise RuntimeError(
            f"{destination.name} still contains reachable active actions: "
            + ", ".join(remaining_active_actions[:10])
        )

    return {"removedActions": removed, "pageCount": len(writer.pages)}


def flatten_outline(reader: PdfReader, items: Iterable[Any] | None = None) -> list[dict[str, Any]]:
    flattened: list[dict[str, Any]] = []
    current = reader.outline if items is None else items
    for item in current:
        if isinstance(item, list):
            flattened.extend(flatten_outline(reader, item))
            continue
        title = getattr(item, "title", None)
        if not title:
            continue
        try:
            page_number = reader.get_destination_page_number(item) + 1
        except Exception:
            page_number = None
        flattened.append({"title": str(title).strip(), "page": page_number})
    return flattened


def extract_pages(source: Path, destination: Path) -> dict[str, Any]:
    reader = PdfReader(source, strict=False)
    destination.parent.mkdir(parents=True, exist_ok=True)
    character_count = 0
    nonempty_pages = 0
    with destination.open("w", encoding="utf-8", newline="\n") as stream:
        for page_number, page in enumerate(reader.pages, start=1):
            try:
                text = page.extract_text(extraction_mode="layout") or ""
            except Exception as exc:
                text = f"[EXTRACTION ERROR: {type(exc).__name__}]"
            text = text.replace("\x00", "").strip()
            character_count += len(text)
            if text:
                nonempty_pages += 1
            stream.write(
                json.dumps(
                    {"page": page_number, "text": text},
                    ensure_ascii=False,
                    separators=(",", ":"),
                )
                + "\n"
            )
    return {
        "characterCount": character_count,
        "nonemptyPages": nonempty_pages,
        "outline": flatten_outline(reader),
    }


def main() -> None:
    SANITIZED_ROOT.mkdir(parents=True, exist_ok=True)
    TEXT_ROOT.mkdir(parents=True, exist_ok=True)
    inventory: list[dict[str, Any]] = []

    for position, metadata in enumerate(SOURCES, start=1):
        source = DOWNLOADS / metadata["file"]
        if not source.exists():
            raise FileNotFoundError(source)
        sanitized = SANITIZED_ROOT / f"{metadata['key']}.pdf"
        pages = TEXT_ROOT / f"{metadata['key']}.jsonl"
        print(f"[{position}/{len(SOURCES)}] {metadata['title']}", flush=True)
        sanitization = sanitize_pdf(source, sanitized)
        extraction = extract_pages(sanitized, pages)
        inventory.append(
            {
                **metadata,
                "originalSha256": sha256(source),
                "sanitizedSha256": sha256(sanitized),
                **sanitization,
                **extraction,
            }
        )

    inventory_path = OUTPUT_ROOT / "inventory.json"
    inventory_path.write_text(
        json.dumps(inventory, ensure_ascii=False, indent=2) + "\n",
        encoding="utf-8",
    )
    print(f"Wrote {inventory_path}", flush=True)


if __name__ == "__main__":
    main()
