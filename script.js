function toggleMenu() {
  const menu = document.getElementById('sideMenu');
  menu.style.left = menu.style.left === '0px' ? '-200px' : '0px';
}

function generateCalendar(startDate, endDate) {
  const container = document.getElementById('calendarContainer');
  let current = new Date(startDate);

  while (current <= endDate) {
    const monthDiv = document.createElement('div');
    monthDiv.className = 'month';

    const title = document.createElement('h3');
    title.textContent = current.toLocaleString('default', { month: 'long', year: 'numeric' });
    monthDiv.appendChild(title);

    container.appendChild(monthDiv);

    current.setMonth(current.getMonth() + 1);
  }
}

function publishPost() {
  const input = document.getElementById('postInput');
  const posts = document.getElementById('posts');

  if (!input.value.trim()) return;

  const post = document.createElement('div');
  post.className = 'post';
  post.innerHTML = `
    <p>${input.value}</p>
    <span class="like-btn" onclick="likePost(this)">❤️ 0</span>
  `;

  posts.prepend(post);
  input.value = '';
}

function likePost(btn) {
  let num = parseInt(btn.textContent.replace('❤️', '').trim());
  num++;
  btn.textContent = `❤️ ${num}`;
}

window.onload = function () {
  generateCalendar(new Date('November 25, 2025'), new Date('June 1, 2026'));
};
