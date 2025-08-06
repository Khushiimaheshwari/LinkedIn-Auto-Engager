const likeInput = document.getElementById("likeCount");
const commentInput = document.getElementById("commentCount");
const btn = document.getElementById("engageBtn");
const btnText = document.getElementById("btnText");
const loadingIndicator = document.getElementById("loadingIndicator");

function validate() {
  const likeValue = parseInt(likeInput.value) || 0;
  const commentValue = parseInt(commentInput.value) || 0;
  
  const isValid = likeValue > 0 || commentValue > 0;
  btn.disabled = !isValid;
  
  if (isValid) {
    btnText.textContent = `Start Engaging`;
      btn.className = "btn-primary text-sm w-full text-white font-medium py-4 px-6 rounded-xl focus:outline-none focus:ring-4 focus:ring-purple-300 focus:ring-opacity-50 relative overflow-hidden transition-all btnText";
  } else {
    btnText.textContent = "Enter Counts To Start";
    btn.className = "w-full bg-white bg-opacity-10 rounded-xl p-4 border border-white text-center text-white text-sm font-medium border-opacity-20 transition-all";
  }
}

function validateInput(input, max) {
  let value = parseInt(input.value);
  if (value > max) {
    input.value = max;
    showTooltip(input, `Maximum ${max} allowed`);
  }
  if (value < 0) {
    input.value = '';
  }
}

function showTooltip(element, message) {
  const tooltip = document.createElement('div');
  tooltip.className = 'absolute bg-red-500 text-white text-xs px-2 py-1 rounded mt-1 z-10';
  tooltip.textContent = message;
  
  element.parentNode.style.position = 'relative';
  element.parentNode.appendChild(tooltip);
  
  setTimeout(() => {
    tooltip.remove();
  }, 2000);
}

likeInput.addEventListener("input", () => {
  validateInput(likeInput, 50);
  validate();
});

commentInput.addEventListener("input", () => {
  validateInput(commentInput, 20);
  validate();
});

btn.addEventListener("click", async () => {
  const likeCount = parseInt(likeInput.value) || 0;
  const commentCount = parseInt(commentInput.value) || 0;

  btn.disabled = true;
  btnText.classList.add('hidden');
  loadingIndicator.classList.remove('hidden');

  try {
    const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });

    await chrome.scripting.executeScript({
      target: { tabId: tab.id },
      func: (likeCount, commentCount) => {
        chrome.storage.local.set({ 
          auto_like: likeCount, 
          auto_comment: commentCount 
        });
        console.log(`Auto engagement set: Likes - ${likeCount}, Comments - ${commentCount}`);
      },
      args: [likeCount, commentCount],
    });
    
    if (tab.url.includes('linkedin.com/feed')) {
      await chrome.scripting.executeScript({
        target: { tabId: tab.id },
        files: ['content.js']
      });
    } else {
      await chrome.tabs.create({ url: "https://www.linkedin.com/feed/" });
    }

    setTimeout(() => window.close(), 3000);

  } catch (error) {
    console.error('Error executing script:', error);
    btnText.classList.remove('hidden');
    loadingIndicator.classList.add('hidden');
    btnText.textContent = "Error - Try Again";
    setTimeout(() => validate(), 2000);
  }
});

document.addEventListener('DOMContentLoaded', () => {
  validate();
});