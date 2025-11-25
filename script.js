/* =================
   Site interaction
   ================= */
const sideMenu = document.getElementById('sideMenu');
const hamburger = document.getElementById('hamburger');
const homeBtn = document.getElementById('homeBtn');
const navLinks = Array.from(document.querySelectorAll('.nav-link[data-close]'));
const calendarContainer = document.getElementById('calendarContainer');

hamburger.addEventListener('click', () => {
  toggleMenu();
});

homeBtn.addEventListener('click', () => {
  // scroll to top / home section
  document.getElementById('home').scrollIntoView({behavior:'smooth'});
  closeMenu();
});

navLinks.forEach(a => {
  a.addEventListener('click', (e) => {
    // close menu when clicked
    closeMenu();
    // allow default anchor to work
  });
});

function toggleMenu(){
  if(sideMenu.classList.contains('open')){
    closeMenu();
  } else {
    openMenu();
  }
}
function openMenu(){
  sideMenu.classList.add('open');
  sideMenu.setAttribute('aria-hidden','false');
}
function closeMenu(){
  sideMenu.classList.remove('open');
  sideMenu.setAttribute('aria-hidden','true');
}

/* =================
   Simple Scroll Calendar (Option A)
   - shows each month in vertical list
   - clickable days open a small modal to add a note (stored local)
   ================= */

const startDate = new Date('November 25, 2025'); // as requested
const endDate = new Date('June 30, 2026'); // include June 2026

// helper: return YYYY-MM-DD
function isoDate(d){ return d.toISOString().slice(0,10); }

// Build months list from start to end
function monthsBetween(start, end){
  const months=[];
  const cur = new Date(start.getFullYear(), start.getMonth(), 1);
  while(cur <= end){
    months.push(new Date(cur.getFullYear(), cur.getMonth(), 1));
    cur.setMonth(cur.getMonth()+1);
  }
  return months;
}

// Local storage key for day notes
const NOTE_KEY = 'psych_forum_day_notes_v1';
let notes = JSON.parse(localStorage.getItem(NOTE_KEY) || '{}');

// Modal elements
const dayModal = document.getElementById('dayModal');
const modalDate = document.getElementById('modalDate');
const modalNote = document.getElementById('modalNote');
const closeModal = document.getElementById('closeModal');
const saveNoteBtn = document.getElementById('saveNote');
const deleteNoteBtn = document.getElementById('deleteNote');
let currentDayKey = null;

closeModal.addEventListener('click', () => hideModal());
saveNoteBtn.addEventListener('click', saveModalNote);
deleteNoteBtn.addEventListener('click', deleteModalNote);

// Render calendar months
function renderCalendar(){
  calendarContainer.innerHTML = '';
  const months = monthsBetween(startDate, endDate);
  months.forEach(mDate => {
    const monthDiv = document.createElement('div');
    monthDiv.className = 'month';
    const title = document.createElement('h3');
    title.textContent = mDate.toLocaleString(undefined, { month:'long', year:'numeric' });
    monthDiv.appendChild(title);

    // weekday headers
    const weekHead = document.createElement('div');
    weekHead.className = 'grid';
    const days = ['Sun','Mon','Tue','Wed','Thu','Fri','Sat'];
    days.forEach(d => {
      const el = document.createElement('div');
      el.className = 'weekday';
      el.textContent = d;
      weekHead.appendChild(el);
    });
    monthDiv.appendChild(weekHead);

    // grid days
    const grid = document.createElement('div');
    grid.className = 'grid';

    const year = mDate.getFullYear();
    const month = mDate.getMonth();
    const first = new Date(year,month,1);
    const last = new Date(year,month+1,0);
    const padStart = first.getDay();
    const daysInMonth = last.getDate();

    // fill padStart empty days to align
    for(let i=0;i<padStart;i++){
      const empty = document.createElement('div');
      empty.className = 'day other';
      grid.appendChild(empty);
    }

    for(let d=1; d<=daysInMonth; d++){
      const dt = new Date(year,month,d);
      const dayEl = document.createElement('div');
      dayEl.className = 'day';
      // highlight days before requested start if month is start month and date < start date
      if(dt < startDate){
        dayEl.classList.add('other');
      }
      const dateNum = document.createElement('div');
      dateNum.className = 'date';
      dateNum.textContent = d;
      dayEl.appendChild(dateNum);

      // show a small note preview if exists
      const key = isoDate(dt);
      if(notes[key]){
        const noteEl = document.createElement('div');
        noteEl.className = 'note';
        noteEl.textContent = notes[key].slice(0,64);
        dayEl.appendChild(noteEl);
      }

      // only allow clicking from startDate onwards
      if(dt >= startDate && dt <= endDate){
        dayEl.addEventListener('click', () => openDayModal(key));
      } else {
        dayEl.style.pointerEvents = 'none';
      }

      grid.appendChild(dayEl);
    }

    monthDiv.appendChild(grid);
    calendarContainer.appendChild(monthDiv);
  });
}

/* Modal behavior */
function openDayModal(key){
  currentDayKey = key;
  modalDate.textContent = new Date(key).toDateString();
  modalNote.value = notes[key] || '';
  dayModal.classList.add('open');
  dayModal.setAttribute('aria-hidden','false');
}
function hideModal(){
  dayModal.classList.remove('open');
  dayModal.setAttribute('aria-hidden','true');
  currentDayKey = null;
}
function saveModalNote(){
  if(!currentDayKey) return;
  const val = modalNote.value.trim();
  if(val){
    notes[currentDayKey] = val;
  } else {
    delete notes[currentDayKey];
  }
  localStorage.setItem(NOTE_KEY, JSON.stringify(notes));
  renderCalendar();
  hideModal();
}
function deleteModalNote(){
  if(!currentDayKey) return;
  delete notes[currentDayKey];
  localStorage.setItem(NOTE_KEY, JSON.stringify(notes));
  renderCalendar();
  hideModal();
}

/* =================
   Forum: publish + like
   - simple local-only storage (localStorage)
   ================= */
const postsEl = document.getElementById('posts');
const publishBtn = document.getElementById('publishBtn');
const postInput = document.getElementById('postInput');
const POSTS_KEY = 'psych_forum_posts_v1';
let posts = JSON.parse(localStorage.getItem(POSTS_KEY) || '[]');

function renderPosts(){
  postsEl.innerHTML = '';
  if(posts.length === 0){
    postsEl.innerHTML = '<div class="muted">No posts yet — start the discussion!</div>';
    return;
  }
  posts.slice().reverse().forEach((p, idx) => {
    const div = document.createElement('div');
    div.className = 'post';
    const meta = document.createElement('div');
    meta.className = 'meta';
    meta.innerHTML = `<div><strong>${p.author || 'Member'}</strong> • <span class="muted">${new Date(p.time).toLocaleString()}</span></div>`;
    const likeBtn = document.createElement('button');
    likeBtn.className = 'like-btn';
    likeBtn.innerHTML = `❤️ ${p.likes || 0}`;
    likeBtn.addEventListener('click', () => {
      p.likes = (p.likes || 0) + 1;
      localStorage.setItem(POSTS_KEY, JSON.stringify(posts));
      renderPosts();
    });

    meta.appendChild(likeBtn);
    const content = document.createElement('div');
    content.className = 'content';
    content.innerHTML = `<p>${escapeHtml(p.text)}</p>`;
    div.appendChild(meta);
    div.appendChild(content);
    postsEl.appendChild(div);
  });
}

publishBtn.addEventListener('click', () => {
  const text = postInput.value.trim();
  if(!text) return;
  posts.push({ text, time: new Date().toISOString(), likes: 0 });
  localStorage.setItem(POSTS_KEY, JSON.stringify(posts));
  postInput.value = '';
  renderPosts();
});

function escapeHtml(unsafe){
  return unsafe
    .replaceAll('&','&amp;')
    .replaceAll('<','&lt;')
    .replaceAll('>','&gt;')
    .replaceAll('"','&quot;')
    .replaceAll("'",'&#039;');
}

/* initial render */
renderCalendar();
renderPosts();

/* close modal when clicking outside content */
dayModal.addEventListener('click', (e) => {
  if(e.target === dayModal) hideModal();
});
