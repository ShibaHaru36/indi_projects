document.addEventListener('DOMContentLoaded', function() {
  const loginForm = document.getElementById('loginForm');
  const drinkForm = document.getElementById('drinkForm');
  const addDrinkForm = document.getElementById('addDrinkForm');
  const deleteDrinkForm = document.getElementById('deleteDrinkForm');
  const logoutButton = document.getElementById('logoutButton');
  const drinkSelect = document.getElementById('drinkSelect');
  const deleteDrinkSelect = document.getElementById('deleteDrinkSelect');
  const drinkList = document.getElementById('drinkList');
  const caffeineLevel = document.getElementById('caffeineLevel');

  const halfLife = 5; // カフェインの半減期（時間）
  let currentUser = null;
  const caffeineRecords = []; // カフェイン記録用配列

  // ログイン処理
  loginForm.addEventListener('submit', function(event) {
    event.preventDefault();

    const username = document.getElementById('username').value.trim();
    const users = JSON.parse(localStorage.getItem('users')) || [];

    if (!users.includes(username)) {
      alert('登録されていないユーザー名です！');
      return;
    }

    currentUser = username;
    loginForm.style.display = 'none';
    drinkForm.style.display = 'block';
    addDrinkForm.style.display = 'block';
    deleteDrinkForm.style.display = 'block';
    logoutButton.style.display = 'block';

    loadDrinks();
    loadUserData();
  });

  // ログアウト処理
  logoutButton.addEventListener('click', function() {
    currentUser = null;
    caffeineRecords.length = 0;
    loginForm.style.display = 'block';
    drinkForm.style.display = 'none';
    addDrinkForm.style.display = 'none';
    deleteDrinkForm.style.display = 'none';
    logoutButton.style.display = 'none';

    drinkSelect.innerHTML = '<option value="" selected disabled>ドリンクを選んでください</option>';
    deleteDrinkSelect.innerHTML = '<option value="" selected disabled>ドリンクを選んでください</option>';
    drinkList.innerHTML = '';
    caffeineLevel.textContent = '現在のカフェインレベル: --- mg';
  });

  // 登録済みドリンクを削除
  deleteDrinkForm.addEventListener('submit', function(event) {
    event.preventDefault();

    const selectedDrink = deleteDrinkSelect.value;

    if (!selectedDrink) {
      alert('削除するドリンクを選択してください！');
      return;
    }

    const drinks = JSON.parse(localStorage.getItem('drinks')) || [];
    const updatedDrinks = drinks.filter(drink => drink.drinkName !== selectedDrink);

    localStorage.setItem('drinks', JSON.stringify(updatedDrinks));

    loadDrinks();
    alert(`${selectedDrink}が削除されました！`);
  });

  // 新しいドリンクを追加
  addDrinkForm.addEventListener('submit', function(event) {
    event.preventDefault();

    const drinkName = document.getElementById('newDrinkName').value.trim();
    const caffeineAmount = parseInt(document.getElementById('newCaffeineAmount').value.trim(), 10);

    if (!drinkName) {
      alert('ドリンク名を入力してください');
      return;
    }

    if (isNaN(caffeineAmount)) {
      alert('有効なカフェイン量を入力してください');
      return;
    }

    const drinks = JSON.parse(localStorage.getItem('drinks')) || [];
    drinks.push({ drinkName, caffeineAmount });
    localStorage.setItem('drinks', JSON.stringify(drinks));

    loadDrinks();
    document.getElementById('newDrinkName').value = '';
    document.getElementById('newCaffeineAmount').value = '';
    alert(`${drinkName}が追加されました！`);
  });

  // ドリンク記録を追加
  drinkForm.addEventListener('submit', function(event) {
    event.preventDefault();

    const drinkName = drinkSelect.value;
    const selectedOption = drinkSelect.options[drinkSelect.selectedIndex];
    const caffeineAmount = parseInt(selectedOption.getAttribute('data-caffeine'), 10);

    if (!drinkName || isNaN(caffeineAmount)) {
      alert('正しいドリンクを選択してください');
      return;
    }

    const timestamp = new Date();
    caffeineRecords.push({ drinkName, caffeineAmount, timestamp });

    const userData = JSON.parse(localStorage.getItem(`${currentUser}_records`)) || [];
    userData.push({ drinkName, caffeineAmount, timestamp });
    localStorage.setItem(`${currentUser}_records`, JSON.stringify(userData));

    addDrinkToList(drinkName, caffeineAmount, timestamp);
    updateCaffeineLevel();
  });

  // 記録リストに表示
  function addDrinkToList(drinkName, caffeineAmount, timestamp) {
    const listItem = document.createElement('li');
    listItem.textContent = `ドリンク: ${drinkName} - カフェイン量: ${caffeineAmount}mg - 時間: ${timestamp.toLocaleString()}`;
    drinkList.appendChild(listItem);
  }

  // カフェインレベルを更新
  function updateCaffeineLevel() {
    const now = new Date();
    let totalCaffeine = 0;

    caffeineRecords.forEach(record => {
      const elapsedHours = (now - new Date(record.timestamp)) / (1000 * 60 * 60);
      const remainingCaffeine = record.caffeineAmount * Math.pow(0.5, elapsedHours / halfLife);
      totalCaffeine += remainingCaffeine;
    });

    caffeineLevel.textContent = `現在のカフェインレベル: ${totalCaffeine.toFixed(2)}mg`;
    localStorage.setItem(`${currentUser}_caffeineLevel`, totalCaffeine.toFixed(2));
  }

  // 登録済みドリンクをロード
  function loadDrinks() {
    const drinks = JSON.parse(localStorage.getItem('drinks')) || [];
    drinkSelect.innerHTML = '<option value="" selected disabled>ドリンクを選んでください</option>';
    deleteDrinkSelect.innerHTML = '<option value="" selected disabled>ドリンクを選んでください</option>';

    drinks.forEach(drink => {
      if (drink.drinkName && !isNaN(drink.caffeineAmount)) {
        const option = document.createElement('option');
        option.value = drink.drinkName;
        option.textContent = `${drink.drinkName} (${drink.caffeineAmount}mg)`;
        option.setAttribute('data-caffeine', drink.caffeineAmount);
        drinkSelect.appendChild(option);

        const deleteOption = option.cloneNode(true);
        deleteDrinkSelect.appendChild(deleteOption);
      }
    });
  }

  // ユーザーデータをロード
  function loadUserData() {
    const savedCaffeineLevel = localStorage.getItem(`${currentUser}_caffeineLevel`);
    const savedRecords = JSON.parse(localStorage.getItem(`${currentUser}_records`)) || [];

    if (savedCaffeineLevel) {
      caffeineLevel.textContent = `現在のカフェインレベル: ${savedCaffeineLevel}mg`;
    }

    caffeineRecords.push(...savedRecords);

    savedRecords.forEach(record => {
      addDrinkToList(record.drinkName, record.caffeineAmount, record.timestamp);
    });

    updateCaffeineLevel();
  }

  // 1分ごとにカフェインレベルを更新
  setInterval(updateCaffeineLevel, 60000);
});
