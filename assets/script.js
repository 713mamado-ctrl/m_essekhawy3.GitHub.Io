const firebaseConfig = {
  apiKey: "AIzaSy...",
  authDomain: "alsekhawy-reviews.firebaseapp.com",
  databaseURL: "https://alsekhawy-reviews-default-rtdb.firebaseio.com",
  projectId: "alsekhawy-reviews",
  storageBucket: "alsekhawy-reviews.appspot.com",
  messagingSenderId: "1234567890",
  appId: "1:1234567890:web:abcdef"
};

firebase.initializeApp(firebaseConfig);
const db = firebase.database();

const form = document.getElementById('reviewForm');
const reviewsContainer = document.querySelector('.reviews');
const msg = document.getElementById('formMessage');

function escapeHtml(str) {
  return String(str)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');
}

function addReviewToPage(id, name, comment) {
  const div = document.createElement('div');
  div.className = 'review';
  div.id = id;
  div.innerHTML = `
    <strong>${escapeHtml(name)}</strong>
    <p>${escapeHtml(comment)}</p>
    <div class="review-actions">
      <span class="edit">✏️</span>
      <span class="delete">🗑️</span>
    </div>
  `;
  reviewsContainer.appendChild(div);

  div.querySelector('.delete').addEventListener('click', () => {
    db.ref('reviews/' + id).remove();
    div.remove();
  });

  div.querySelector('.edit').addEventListener('click', () => {
    const newText = prompt('عدل تعليقك:', comment);
    if (newText) {
      db.ref('reviews/' + id).update({ comment: newText });
      div.querySelector('p').textContent = newText;
    }
  });
}

db.ref('reviews').on('value', snapshot => {
  reviewsContainer.innerHTML = '';
  snapshot.forEach(child => {
    const data = child.val();
    addReviewToPage(child.key, data.name, data.comment);
  });
});

form.addEventListener('submit', e => {
  e.preventDefault();
  const name = document.getElementById('name').value.trim();
  const email = document.getElementById('email').value.trim();
  const comment = document.getElementById('comment').value.trim();

  if (!name || !email || !comment) {
    msg.textContent = 'الرجاء ملء كل الحقول.';
    msg.className = 'error';
    return;
  }

  const newRef = db.ref('reviews').push();
  newRef.set({ name, comment })
    .then(() => {
      msg.textContent = 'تم الإرسال!';
      msg.className = 'success';
      form.reset();
    })
    .catch(() => {
      msg.textContent = 'فشل الإرسال — تحقق من اتصال الإنترنت.';
      msg.className = 'error';
    });
});
