import './style.css'

// Called when session starts
window.addEventListener('DOMContentLoaded', () => {
  loadHand();
  addPlaceholder();
  fanCards();
  enableHandReordering();
});

const dropzone = document.getElementById("dropzone");
const hand = document.getElementById("hand");

// Create an invisible placeholder for first-card insertion
function addPlaceholder() {
  let placeholder = hand.querySelector('.placeholder');
  if (!placeholder) {
    placeholder = document.createElement('div');
    placeholder.classList.add('card', 'placeholder');
    hand.insertBefore(placeholder, hand.firstChild);

    placeholder.addEventListener('dragover', e => {
      e.preventDefault();
      placeholder.classList.add('drag-over');
      e.dataTransfer.dropEffect = 'move';
    });

    placeholder.addEventListener('dragleave', () => {
      placeholder.classList.remove('drag-over');
    });

    placeholder.addEventListener('drop', e => {
      e.preventDefault();
      placeholder.classList.remove('drag-over');
      if (draggedCard) {
        hand.insertBefore(draggedCard, placeholder.nextSibling);
        afterReorder();
      }
    });
  }
}

// Persist hand order and contents to localStorage
function saveHand() {
  const urls = Array.from(hand.querySelectorAll('.card'))
    .filter(el => !el.classList.contains('placeholder'))
    .map(img => img.src);
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

// Dropzone handlers
let draggedCard = null;

dropzone.addEventListener("dragover", e => {
  e.preventDefault();
  dropzone.style.background = "#ccf";
});

dropzone.addEventListener("dragleave", () => {
  dropzone.style.background = "transparent";
});

// event when a card or file is dropped onto the drop zone.
dropzone.addEventListener("drop", async e => {
  e.preventDefault();
  dropzone.style.background = "transparent";

  // If dragging an existing card, delete it
  if (draggedCard) {
    hand.removeChild(draggedCard);
    draggedCard = null;
  }
  // Else if user dropped new files, add cards
  else if (e.dataTransfer.files && e.dataTransfer.files.length) {
    for (const file of e.dataTransfer.files) {
      if (!file.type.startsWith("image/")) continue;
      const url = URL.createObjectURL(file);
      const img = document.createElement("img");
      img.src   = url;
      img.classList.add("card");
      hand.appendChild(img);
    }
  }

  addPlaceholder();
  afterReorder();
});

// Simple card preview on click
// (unchanged)
document.addEventListener("click", e => {
  const previewOpen = !!document.body.querySelector(".preview");
  const clickedCard = e.target.closest(".card:not(.placeholder)");

  if (!previewOpen && clickedCard) {
    clickedCard.classList.add("hidden");
    document.body.classList.add("preview-open");
    const wrapper = document.createElement("div");
    wrapper.classList.add("preview");
    const clone = clickedCard.cloneNode(true);
    clone.style.setProperty("--angle", "0deg");
    clone.style.marginLeft = "0";
    clone.classList.remove("hidden");
    wrapper.appendChild(clone);
    document.body.appendChild(wrapper);
  } else if (previewOpen) {
    const wrapper = document.body.querySelector(".preview");
    wrapper && wrapper.remove();
    const hidden = hand.querySelector(".card.hidden");
    hidden && hidden.classList.remove("hidden");
    document.body.classList.remove("preview-open");
  }
});

// Fan cards like a naturally held hand of cards.
function fanCards() {
  const cards = Array.from(document.querySelectorAll("#hand .card:not(.placeholder)"));
  const count = cards.length;
  if (!count) return;

  const totalAngle = 30;
  const start      = -totalAngle / 2;
  const step       = totalAngle / (count - 1 || 1);

  cards.forEach((card, i) => {
    const angle = start + step * i;
    card.style.setProperty("--angle", `${angle}deg`);
    card.style.zIndex = i + 1;
  });
}

// Reordering logic
function enableHandReordering() {
  addPlaceholder();
  const cards = hand.querySelectorAll('.card:not(.placeholder)');
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
  e.dataTransfer.effectAllowed = 'move';
  e.dataTransfer.setData('text/plain', '');
}
function onCardDragOver(e) {
  e.preventDefault();
  const target = e.currentTarget;
  if (target !== draggedCard) {
    target.classList.add('drag-over');
    e.dataTransfer.dropEffect = 'move';
  }
}
function onCardDragLeave(e) { e.currentTarget.classList.remove('drag-over'); }
function onCardDrop(e) {
  e.preventDefault();
  const target = e.currentTarget;
  target.classList.remove('drag-over');
  if (draggedCard && target !== draggedCard) {
    hand.insertBefore(draggedCard, target.nextSibling);
    afterReorder();
  }
}
function onCardDragEnd() {
  if (draggedCard) {
    draggedCard.classList.remove('dragging');
    draggedCard = null;
  }
  hand.querySelectorAll('.drag-over').forEach(c => c.classList.remove('drag-over'));
}

// After any add, remove, or reorder
function afterReorder() {
  fanCards();
  enableHandReordering();
  saveHand();
}
