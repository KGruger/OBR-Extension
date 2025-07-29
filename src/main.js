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

document.addEventListener("click", e => {
  const previewOpen = !!document.body.querySelector(".preview");
  const clickedCard = e.target.closest(".card");

  if (!previewOpen && clickedCard) {
    // 1) hide the original
    clickedCard.classList.add("hidden");

    // 2) let the rest of the UI know we’re in “preview” mode
    document.body.classList.add("preview-open");

    // 3) wrap & overlay the preview
    const wrapper = document.createElement("div");
    wrapper.classList.add("preview");
    // clone the image into our wrapper
    const clone = clickedCard.cloneNode(true);
    clone.classList.remove("hidden");
    wrapper.appendChild(clone);

    document.body.appendChild(wrapper);
  }
  else if (previewOpen) {
    // 1) remove the floating preview
    const wrapper = document.body.querySelector(".preview");
    wrapper && wrapper.remove();

    // 2) un‑hide the original
    const hidden = hand.querySelector(".card.hidden");
    hidden && hidden.classList.remove("hidden");

    // 3) clear preview mode
    document.body.classList.remove("preview-open");
  }
});