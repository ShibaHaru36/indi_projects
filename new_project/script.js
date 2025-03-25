document.addEventListener('DOMContentLoaded', function() {
  const loginForm = document.getElementById('loginForm');
  const drinkForm = document.getElementById('drinkForm');
  const addDrinkForm = document.getElementById('addDrinkForm');
  const drinkSelect = document.getElementById('drinkSelect');
  const caffeineAmountInput = document.getElementById('caffeineAmount');
  const drinkList = document.getElementById('drinkList');
  const welcomeMessage = document.getElementById('welcomeMessage');
  const newDrinkName = document.getElementById('newDrinkName');
  const newCaffeineAmount = document.getElementById('newCaffeineAmount');
  const caffeineLevel = document.getElementById('caffeineLevel');

  const halfLife = 5; // カフェインの半減期（時間）
  const caffeineRecords = []; // カフェイン記録用配列
  let currentUser = null;

  // ユーザーのログイン処理
  loginForm.addEventListener('submit', function(event) {
    event.preventDefault();

    const username = document.getElementById('username').value.trim();
    if (username === '') {
      alert('ユーザー名を入力してください');
      return;
    }

    currentUser = username;
    loginForm.style.display = 'none';
    drinkForm.style.display = 'block';
    addDrinkForm.style.display = 'block';
    welcomeMessage.style.display = 'block';
    welcomeMessage.textContent = `ようこそ、${currentUser} さん！`;

    loadUserData();
  });

  // ドリンク選択時のカフェイン量の自動入力
  drinkSelect.addEventListener('change', function() {
    const selectedOption = drinkSelect.options[drinkSelect.selectedIndex];
    const caffeineAmount = selectedOption.getAttribute('data-caffeine');
    caffeineAmountInput.value = caffeineAmount;
  });

  // ドリンク記録の保存
  drinkForm.addEventListener('submit', function(event) {
    event.preventDefault();

    const drinkName = drinkSelect.value;
    const caffeineAmount = parseInt(caffeineAmountInput.value, 10);
    const timestamp = new Date().toISOString();

    const userData = JSON.parse(localStorage.getItem(currentUser)) || [];
    userData.push({ drinkName, caffeineAmount, timestamp });
    localStorage.setItem(currentUser, JSON.stringify(userData));

    addDrinkToList(drinkName, caffeineAmount, timestamp);
    updateCaffeineLevel();
  });

  // 新しいドリンクを追加
  addDrinkForm.addEventListener('submit', function(event) {
    event.preventDefault();

    const drinkName = newDrinkName.value.trim();
    const caffeineAmount = parseInt(newCaffeineAmount.value, 10);

    if (!drinkName || isNaN(caffeineAmount)) {
      alert('ドリンク名とカフェイン量を正しく入力してください');
      return;
    }

    // 新しいドリンクを選択肢に追加
    const newOption = document.createElement('option');
    newOption.value = drinkName;
    newOption.textContent = `${drinkName} (${caffeineAmount}mg)`;
    newOption.setAttribute('data-caffeine', caffeineAmount);
    drinkSelect.appendChild(newOption);

    // フォームをリセット
    newDrinkName.value = '';
    newCaffeineAmount.value = '';
    alert(`${drinkName}が追加されました！`);
  });

  // 記録リストにドリンクを追加
  function addDrinkToList(drinkName, caffeineAmount, timestamp) {
    const listItem = document.createElement('li');
    listItem.textContent = `ドリンク: ${drinkName} - カフェイン量: ${caffeineAmount}mg - 時間: ${new Date(timestamp).toLocaleString()}`;
    drinkList.appendChild(listItem);
  }

  // カフェインレベルの更新
  function updateCaffeineLevel() {
    const now = new Date();
    let totalCaffeine = 0;

    const userData = JSON.parse(localStorage.getItem(currentUser)) || [];
    userData.forEach(record => {
      const hoursElapsed = (now - new Date(record.timestamp)) / (1000 * 60 * 60);
      const remainingCaffeine = record.caffeineAmount * Math.pow(0.5, hoursElapsed / halfLife);
      totalCaffeine += remainingCaffeine;
    });

    caffeineLevel.textContent = `現在のカフェインレベル: ${totalCaffeine.toFixed(2)}mg`;
  }

  // ログイン時にユーザーデータをロード
  function loadUserData() {
    const userData = JSON.parse(localStorage.getItem(currentUser)) || [];
    userData.forEach(record => {
      addDrinkToList(record.drinkName, record.caffeineAmount, record.timestamp);
    });

    updateCaffeineLevel();
  }
});
