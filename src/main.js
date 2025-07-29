import './style.css'

const dropzone = document.getElementById("dropzone");
const hand = document.getElementById("hand");

dropzone.addEventListener("dragover", (e) => {
  e.preventDefault();
  dropzone.style.background = "#ccf";
});

dropzone.addEventListener("dragleave", () => {
  dropzone.style.background = "transparent";
});

dropzone.addEventListener("drop", async e => {
  e.preventDefault();
  dropzone.style.background = "transparent";

  for (const file of e.dataTransfer.files) {
    if (!file.type.startsWith("image/")) continue;
    const url = URL.createObjectURL(file);
    const img = document.createElement("img");
    img.src   = url;
    img.classList.add("card");

    hand.appendChild(img);
  }
});

document.addEventListener("click", (e) => {
  const isPreviewOpen = !!document.body.querySelector(".preview");
  const clickedCard   = e.target.closest(".card");

  if (!isPreviewOpen && clickedCard) {
    // 1) hide the original
    clickedCard.classList.add("hidden");
    // 2) clone & overlay the preview
    const preview = clickedCard.cloneNode(true);
    preview.classList.add("preview");
    document.body.appendChild(preview);
  }
  else if (isPreviewOpen) {
    // 1) remove preview
    const preview = document.body.querySelector(".preview");
    if (preview) preview.remove();
    // 2) un‑hide the original
    const hidden = hand.querySelector(".card.hidden");
    if (hidden) hidden.classList.remove("hidden");
  }
});