document.addEventListener("DOMContentLoaded", function () {
    const checkboxes = document.querySelectorAll(".task-checkbox");
    const updateBtn = document.querySelector(".update-btn");
  
    checkboxes.forEach(function (checkbox) {
      checkbox.addEventListener("change", function (event) {
        event.preventDefault();
        setTimeout(function () {
            event.target.closest('form').submit();
          }, 3000); // 1 second delay
        
      });
    });
  
    updateBtn.addEventListener("click", function () {
      checkboxes.forEach(function (checkbox) {
        if (checkbox.checked) {
          checkbox.closest("form").submit();
        }
      });
    });
  });


