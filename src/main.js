import './style.css'

// Called when session starts
window.addEventListener('DOMContentLoaded', () => {
  loadHand();
  fanCards();
  enableHandReordering();
});

const dropzone = document.getElementById("dropzone");
const hand = document.getElementById("hand");


dropzone.addEventListener("dragover", (e) => {
  e.preventDefault();
  dropzone.style.background = "#ccf";
});

dropzone.addEventListener("dragleave", () => {
  dropzone.style.background = "transparent";
});

// event when a card is dropped onto the drop zone.
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
  fanCards();
  enableHandReordering();
  saveHand();
});

// Preview a card when clicked.
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
    clone.style.setProperty("--angle", "0deg");
    clone.style.marginLeft = "0";
    
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


// fan cards like a naturally held hand of cards.
function fanCards() {
  const cards = Array.from(document.querySelectorAll("#hand .card"));
  const count = cards.length;
  if (!count) return;

  const totalAngle = 30;
  const start      = -totalAngle / 2;
  const step       = totalAngle / (count - 1 || 1);

  cards.forEach((card, i) => {
    const angle = start + step * i;
    // set CSS variable instead of inline transform
    card.style.setProperty("--angle", `${angle}deg`);

    card.style.zIndex = i + 1;

  });
}

// Functions and event listeners to handle drag-and-drop cards within hand to rearrange them.
hand.addEventListener('dragover', e => {
  e.preventDefault();
  // only light up if we’re over the container (not over a card)
  if (e.target === hand && draggedCard) {
    hand.classList.add('drag-over-left');
    e.dataTransfer.dropEffect = 'move';
  }
});

hand.addEventListener('dragleave', e => {
  if (e.target === hand) {
    hand.classList.remove('drag-over-left');
  }
});

hand.addEventListener('drop', e => {
  e.preventDefault();
  hand.classList.remove('drag-over-left');
  if (e.target === hand && draggedCard) {
    // drop before the very first card
    hand.insertBefore(draggedCard, hand.firstChild);
    fanCards();
    enableHandReordering();
    saveHand();
  }
});

let draggedCard = null;

function enableHandReordering() {
  const cards = hand.querySelectorAll('.card');
  cards.forEach(card => {
    if (card.dataset.reorderable) return;
    card.dataset.reorderable = 'true';

    card.setAttribute('draggable', true);
    card.addEventListener('dragstart', onCardDragStart);
    card.addEventListener('dragover', onCardDragOver);
    card.addEventListener('dragleave', onCardDragLeave);
    card.addEventListener('drop', onCardDrop);
    card.addEventListener('dragend', onCardDragEnd);
  });
}

function onCardDragStart(e) {
  draggedCard = e.currentTarget;
  draggedCard.classList.add('dragging');
  // required for dragover to fire in Firefox
  e.dataTransfer.effectAllowed = 'move';
  e.dataTransfer.setData('text/plain', '');
}

function onCardDragOver(e) {
  e.preventDefault(); // allow drop
  const target = e.currentTarget;
  if (target !== draggedCard) {
    target.classList.add('drag-over');
    e.dataTransfer.dropEffect = 'move';
  }
}

function onCardDragLeave(e) {
  e.currentTarget.classList.remove('drag-over');
}

function onCardDrop(e) {
  e.preventDefault();
  const target = e.currentTarget;
  target.classList.remove('drag-over');

  if (draggedCard && target !== draggedCard) {
    const next = target.nextSibling;
    hand.insertBefore(draggedCard, next);
    fanCards();
    enableHandReordering();
    saveHand();
  }
}

function onCardDragEnd(e) {
  if (draggedCard) {
    draggedCard.classList.remove('dragging');
    draggedCard = null;
  }
  // clean up any leftover highlight
  hand.querySelectorAll('.drag-over').forEach(c => c.classList.remove('drag-over'));
}



// save load functions
// Persist hand order and contents to localStorage
function saveHand() {
  const urls = Array.from(hand.querySelectorAll('.card')).map(img => img.src);
  localStorage.setItem('cardHand', JSON.stringify(urls));
}

function loadHand() {
  const data = localStorage.getItem('cardHand');
  if (!data) return;
  try {
    const urls = JSON.parse(data);
    urls.forEach(url => {
      const img = document.createElement('img');
      img.src = url;
      img.classList.add('card');
      hand.appendChild(img);
    });
  } catch (e) {
    console.error('Failed to load hand from localStorage', e);
  }
}