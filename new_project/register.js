document.addEventListener('DOMContentLoaded', function() {
  const registerForm = document.getElementById('registerForm');
  const deleteUserForm = document.getElementById('deleteUserForm');

  // ユーザー登録処理
  registerForm.addEventListener('submit', function(event) {
    event.preventDefault();

    const newUsername = document.getElementById('newUsername').value.trim();
    if (newUsername === '') {
      alert('ユーザー名を入力してください！');
      return;
    }

    const users = JSON.parse(localStorage.getItem('users')) || [];
    if (users.includes(newUsername)) {
      alert('このユーザー名は既に登録されています！');
      return;
    }

    users.push(newUsername);
    localStorage.setItem('users', JSON.stringify(users));
    alert(`${newUsername}が登録されました！`);
    document.getElementById('newUsername').value = '';
  });

  // ユーザー削除処理
  deleteUserForm.addEventListener('submit', function(event) {
    event.preventDefault();

    const deleteUsername = document.getElementById('deleteUsername').value.trim();
    if (deleteUsername === '') {
      alert('ユーザー名を入力してください！');
      return;
    }

    const users = JSON.parse(localStorage.getItem('users')) || [];
    const index = users.indexOf(deleteUsername);

    if (index === -1) {
      alert('このユーザー名は登録されていません！');
      return;
    }

    // ユーザー名を削除
    users.splice(index, 1);
    localStorage.setItem('users', JSON.stringify(users));
    alert(`${deleteUsername}が削除されました！`);
    document.getElementById('deleteUsername').value = '';
  });
});
