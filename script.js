let orderList = JSON.parse(localStorage.getItem("orderList")) || [];
let totalPrice = localStorage.getItem("totalPrice")
  ? parseFloat(localStorage.getItem("totalPrice"))
  : 0;

document.addEventListener("DOMContentLoaded", () => {
  fetchMenuItems();
  clearOrder();
  updateTotalPrice();
});

function fetchMenuItems() {
  fetch("https://www.themealdb.com/api/json/v1/1/search.php?s=")
    .then((response) => response.json())
    .then((data) => {
      const meals = data.meals;
      const menuContainer = document.querySelector(".menu-container");
      menuContainer.innerHTML = "";

      if (meals) {
        meals.forEach((meal) => {
          let itemPrice = parseFloat(
            localStorage.getItem(`price_${meal.idMeal}`)
          );
          if (!itemPrice) {
            itemPrice = Math.floor(Math.random() * 191) + 10;
            localStorage.setItem(`price_${meal.idMeal}`, itemPrice);
          }

          const menuItem = document.createElement("div");
          menuItem.classList.add("menu-item");
          menuItem.innerHTML = `
            <h3>${meal.strMeal}</h3>
            <img src="${meal.strMealThumb}" alt="${meal.strMeal}">
            <p><strong>Category:</strong> ${meal.strCategory}</p>
            <p><strong>Area:</strong> ${meal.strArea}</p>
            <p><strong>Price:</strong> $${itemPrice.toFixed(2)}</p>
            <button onclick="addItemFromMenu('${meal.strMeal}', '${
            meal.strMealThumb
          }', ${itemPrice})">Add to Order</button>
          `;
          menuContainer.appendChild(menuItem);
        });
      } else {
        menuContainer.innerHTML = "<p>No meals found</p>";
      }
    })
    .catch((error) => console.log("Error fetching data:", error));
}

function searchMeals() {
  const searchInput = document.getElementById("search-input").value.trim();
  if (searchInput === "") {
    fetchMenuItems();
    return;
  }

  fetch(`https://www.themealdb.com/api/json/v1/1/search.php?s=${searchInput}`)
    .then((response) => response.json())
    .then((data) => {
      const meals = data.meals;
      const menuContainer = document.querySelector(".menu-container");
      menuContainer.innerHTML = "";

      if (meals) {
        meals.forEach((meal) => {
          let itemPrice = parseFloat(
            localStorage.getItem(`price_${meal.idMeal}`)
          );
          if (!itemPrice) {
            itemPrice = Math.floor(Math.random() * 191) + 10;
            localStorage.setItem(`price_${meal.idMeal}`, itemPrice);
          }

          const menuItem = document.createElement("div");
          menuItem.classList.add("menu-item");
          menuItem.innerHTML = `
            <h3>${meal.strMeal}</h3>
            <img src="${meal.strMealThumb}" alt="${meal.strMeal}">
            <p><strong>Category:</strong> ${meal.strCategory}</p>
            <p><strong>Area:</strong> ${meal.strArea}</p>
            <p><strong>Price:</strong> $${itemPrice.toFixed(2)}</p>
            <button onclick="addItemFromMenu('${meal.strMeal}', '${
            meal.strMealThumb
          }', ${itemPrice})">Add to Order</button>
          `;
          menuContainer.appendChild(menuItem);
        });
      } else {
        menuContainer.innerHTML = "<p>No meals found</p>";
      }
    })
    .catch((error) => console.log("Error fetching data:", error));
}

function addItemFromMenu(itemName, itemImage, itemPrice) {
  const existingItem = orderList.find((item) => item.name === itemName);
  if (existingItem) {
    existingItem.quantity++;
    existingItem.totalPrice += itemPrice;
  } else {
    orderList.push({
      name: itemName,
      price: itemPrice,
      quantity: 1,
      totalPrice: itemPrice,
    });
  }

  updateOrderList();
  updateTotalPrice();
  updateLocalStorage();
}

function increaseItemQuantity(index) {
  orderList[index].quantity++;
  orderList[index].totalPrice += orderList[index].price;
  updateOrderList();
  updateTotalPrice();
  updateLocalStorage();
}

function decreaseItemQuantity(index) {
  if (orderList[index].quantity > 1) {
    orderList[index].quantity--;
    orderList[index].totalPrice -= orderList[index].price;
    updateOrderList();
    updateTotalPrice();
    updateLocalStorage();
  }
}

function updateOrderList() {
  const orderListContainer = document.querySelector(".order-list");
  orderListContainer.innerHTML = "";

  if (orderList.length === 0) {
    orderListContainer.innerHTML = "<p>No items in order</p>";
    updateOrderSummary(); // Update order summary even when there are no items
    return; // Exit the function early if there are no items
  }

  orderList.forEach((item, index) => {
    const listItem = document.createElement("div");
    listItem.classList.add("order-item");
    listItem.innerHTML = `
      <span>${item.name}  
        <button onclick="decreaseItemQuantity(${index})">-</button>
        ${item.quantity}
        <button onclick="increaseItemQuantity(${index})">+</button>
        - $${item.totalPrice.toFixed(2)}
      </span>
      <button onclick="removeItem(${index})" class="remove-btn">Remove</button>
    `;
    orderListContainer.appendChild(listItem);
  });

  updateOrderSummary();
}

function removeItem(index) {
  const removedItem = orderList.splice(index, 1)[0];
  totalPrice -= removedItem.totalPrice;
  updateOrderList();
  updateTotalPrice();
  updateLocalStorage();
}

function clearOrder() {
  orderList = [];
  totalPrice = 0;
  updateOrderList();
  updateTotalPrice();
  updateLocalStorage();
}

function updateTotalPrice() {
  const totalPriceElement = document.getElementById("total-price");
  totalPriceElement.textContent = totalPrice.toFixed(2);
}

function updateOrderSummary() {
  const orderSummaryContainer = document.querySelector(".order-summary");
  const totalItems = orderList.reduce(
    (total, item) => total + item.quantity,
    0
  );
  const totalPrice = orderList.reduce(
    (total, item) => total + item.totalPrice,
    0
  );

  orderSummaryContainer.innerHTML = `
    <p>Total Items: ${totalItems}</p>
    <p>Total Price: $${totalPrice.toFixed(2)}</p>
  `;
}

function updateLocalStorage() {
  localStorage.setItem("orderList", JSON.stringify(orderList));
  localStorage.setItem("totalPrice", totalPrice.toFixed(2));
}
function generateBill() {
  const totalPrice = orderList.reduce(
    (total, item) => total + item.totalPrice,
    0
  );
  const billContent = `
    <html>
    <head>
      <title>Bill Summary</title>
      <link rel="stylesheet" type="text/css" href="bill.css">
    </head>
    <body>
  <div class="bill">
    <div class="bill-header">
      <h1>Bill Summary</h1>
    </div>
    <div class="bill-details">
      <h2>Order Details</h2>
      <ul>
        ${orderList
          .map(
            (item) =>
              `<li>${item.name} - ${item.quantity} x $${item.price.toFixed(
                2
              )} = $${(item.quantity * item.price).toFixed(2)}</li>`
          )
          .join("")}
      </ul>
    </div>
    <div class="total">
      <p>Total Price: $${totalPrice.toFixed(2)}</p>
    </div>
  </div>
</body>
    </html>
  `;

  const billWindow = window.open();
  billWindow.document.write(billContent);
}
