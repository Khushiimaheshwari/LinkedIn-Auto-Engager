function sleep(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

function randomDelay(min = 1000, max = 3000) {
  const delay = Math.floor(Math.random() * (max - min + 1)) + min;
  return sleep(delay);
}

function createStatusIndicator() {
  const indicator = document.createElement('div');
  indicator.id = 'linkedin-auto-engage-status';
  indicator.style.cssText = `
    position: fixed;
    top: 20px;
    right: 20px;
    background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
    color: white;
    padding: 12px 16px;
    border-radius: 25px;
    font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
    font-size: 14px;
    font-weight: 600;
    box-shadow: 0 4px 20px rgba(0,0,0,0.15);
    z-index: 10000;
    backdrop-filter: blur(10px);
    border: 1px solid rgba(255,255,255,0.2);
    transition: all 0.3s ease;
  `;
  document.body.appendChild(indicator);
  return indicator;
}

function updateStatus(message, type = 'info') {
  const indicator = document.getElementById('linkedin-auto-engage-status');
  if (indicator) {
    indicator.textContent = message;
    
    switch(type) {
      case 'success':
        indicator.style.background = 'linear-gradient(135deg, #10b981 0%, #059669 100%)';
        break;
      case 'error':
        indicator.style.background = 'linear-gradient(135deg, #ef4444 0%, #dc2626 100%)';
        break;
      case 'warning':
        indicator.style.background = 'linear-gradient(135deg, #f59e0b 0%, #d97706 100%)';
        break;
      default:
        indicator.style.background = 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)';
    }
  }
}

function removeStatusIndicator() {
  const indicator = document.getElementById('linkedin-auto-engage-status');
  if (indicator) {
    indicator.style.transform = 'translateX(100%)';
    indicator.style.opacity = '0';
    setTimeout(() => indicator.remove(), 300);
  }
}

function getPosts() {
  const selectors = [
    'div.feed-shared-update-v2',
    'div[data-id*="urn:li:activity"]',
    'div.feed-shared-update-v2--minimal-padding',
    '.feed-shared-update-v2'
  ];
  
  let posts = [];
  for (const selector of selectors) {
    posts = [...document.querySelectorAll(selector)];
    if (posts.length > 0) break;
  }
  
  return posts.filter(post => {
    const promotedText = post.textContent.toLowerCase();
    return !promotedText.includes('promoted') && 
           !promotedText.includes('sponsored') &&
           !post.querySelector('[data-test-id*="ad"]');
  });
}

async function likePost(post) {
  const likeSelectors = [
    'button[aria-label*="Like"]',
    'button[aria-label*="React"]',
    'button[data-control-name="like"]',
    '.react-button__trigger',
    '[data-test-id="like-button"]'
  ];
  
  for (const selector of likeSelectors) {
    const likeBtn = post.querySelector(selector);
    if (likeBtn && !likeBtn.classList.contains('react-button__trigger--active')
        && likeBtn.getAttribute('aria-pressed') !== 'true'
    ) {
      likeBtn.scrollIntoView({ behavior: 'smooth', block: 'center' });
      await randomDelay(500, 1000);
      
      const rect = likeBtn.getBoundingClientRect();
      const event = new MouseEvent('click', {
        bubbles: true,
        cancelable: true,
        clientX: rect.left + rect.width/2 + (Math.random() - 0.5) * 10,
        clientY: rect.top + rect.height/2 + (Math.random() - 0.5) * 10
      });
      likeBtn.dispatchEvent(event);
      
      return true;
    }
  }
  return false;
}

async function commentOnPost(post) {
  const commentMessages = [
    "Great insights! ",
    "Thanks for sharing this!",
    "Very informative post ",
    "Interesting perspective!",
    "Well said! ",
    "Couldn't agree more!",
    "This is valuable content",
    "Thanks for the update!",
    "Great point! ",
    "Love this! "
  ];
  
  const commentSelectors = [
    'button[aria-label*="Comment"]',
    'button[data-control-name="comment"]',
    '.comment-button',
    '[data-test-id="comment-button"]'
  ];
  
  for (const selector of commentSelectors) {
    const commentBtn = post.querySelector(selector);
    if (commentBtn) {
      commentBtn.scrollIntoView({ behavior: 'smooth', block: 'center' });
      await randomDelay(500, 1000);
      
      commentBtn.click();
      await randomDelay(1000, 2000);
      
      const textareaSelectors = [
        'textarea[placeholder*="comment"]',
        '.ql-editor[data-placeholder*="comment"]',
        'div[data-placeholder*="Add a comment"]',
        '.comments-comment-texteditor'
      ];
      
      for (const textareaSelector of textareaSelectors) {
        const textarea = post.querySelector(textareaSelector) || 
                         document.querySelector(textareaSelector);
        if (textarea) {
          const message = commentMessages[Math.floor(Math.random() * commentMessages.length)];
          
          textarea.focus();
          await randomDelay(200, 500);
          
          if (textarea.tagName === 'TEXTAREA') {
            textarea.value = message;
            textarea.dispatchEvent(new Event('input', { bubbles: true }));
          } else {
            textarea.textContent = message;
            textarea.dispatchEvent(new Event('input', { bubbles: true }));
          }
          
          await randomDelay(1000, 2000);
          
          const submitSelectors = [
            'button.comments-comment-box__submit-button',
            'button[data-control-name="comment.post"]',
            'button[type="submit"]',
            '.comments-comment-box__submit-button--cr'
          ];
          
          for (const submitSelector of submitSelectors) {
            const submitBtn = post.querySelector(submitSelector) || 
                             document.querySelector(submitSelector);
            if (submitBtn && !submitBtn.disabled) {
              submitBtn.click();
              return true;
            }
          }
        }
      }
    }
  }
  return false;
}

function autoEngage() {
  chrome.storage.local.get(["auto_like", "auto_comment"], (result) => {
    const likeCount = parseInt(result.auto_like) || 0;
    const commentCount = parseInt(result.auto_comment) || 0;

    if (likeCount === 0 && commentCount === 0) {
      console.log('No engagement targets set');
      return;
    }

    runEngagement(likeCount, commentCount);
  });
}
  
async function runEngagement(likeCount, commentCount) {
  const statusIndicator = createStatusIndicator();
  updateStatus('Starting LinkedIn Auto Engage');

  let liked = 0;
  let commented = 0;
  let attempts = 0;
  const maxAttempts = 3;

  try {
    while (attempts < maxAttempts && (liked < likeCount || commented < commentCount)) {
      updateStatus(`Progress: ${liked}/${likeCount} likes, ${commented}/${commentCount} comments`);

      const posts = getPosts();

      if (posts.length === 0) {
        updateStatus(' Waiting for posts to load...', 'warning');
        await sleep(3000);
        attempts++;
        continue;
      }

      for (let i = 0; i < posts.length && (liked < likeCount || commented < commentCount); i++) {
        const post = posts[i];

        post.scrollIntoView({ behavior: 'smooth', block: 'center' });
        await randomDelay(1000, 2000);

        if (liked < likeCount) {
          updateStatus(`Liking post ${liked + 1}/${likeCount}`);
          const likeSuccess = await likePost(post);
          if (likeSuccess) {
            liked++;
            await randomDelay(1500, 3000);
          }
        }

        if (commented < commentCount) {
          updateStatus(`Commenting on post ${commented + 1}/${commentCount}`);
          const commentSuccess = await commentOnPost(post);
          if (commentSuccess) {
            commented++;
            await randomDelay(2000, 4000);
          }
        }

        await randomDelay(1000, 2000);
      }

      if (liked < likeCount || commented < commentCount) {
        updateStatus(' Loading more posts...');
        window.scrollTo(0, document.body.scrollHeight);
        await sleep(3000);
        attempts++;
      }
    }

    updateStatus(`Complete! ${liked} likes, ${commented} comments`, 'success');

    chrome.storage.local.remove(["auto_like", "auto_comment"]);
    setTimeout(() => {
      removeStatusIndicator();
      window.close();
    }, 8000);

  } catch (error) {
    console.error('Auto engage error:', error);
    updateStatus('Error occurred during engagement', 'error');
  }

  setTimeout(() => {
    removeStatusIndicator();
  }, 5000);
}

if (window.location.href.includes("linkedin.com/feed") || 
    window.location.href.includes("linkedin.com/in/")) {
  
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => {
      setTimeout(() => autoEngage(), 3000);
    });
  } else {
    setTimeout(() => autoEngage(), 3000);
  }
}

window.autoEngage = autoEngage;