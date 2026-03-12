// Global state
let messages = [];
let currentTheme = 'whatsapp';
let editingId = null;
let typingTimer;
let storyIndex = 0;
let storyMessages = [];

// DOM elements
const chatMessagesDiv = document.getElementById('chatMessages');
const themeBtns = document.querySelectorAll('.theme-btn');
const addMsgBtn = document.getElementById('addMessageBtn');
const msgSender = document.getElementById('msgSender');
const msgText = document.getElementById('msgText');
const msgSide = document.getElementById('msgSide');
const msgTime = document.getElementById('msgTime');
const msgAvatar = document.getElementById('msgAvatar');
const darkToggle = document.getElementById('darkToggle');
const headerSubtext = document.getElementById('headerSubtext');
const statusOnline = document.getElementById('statusOnline');
const statusTyping = document.getElementById('statusTyping');
const statusLastSeen = document.getElementById('statusLastSeen');
const statusRecording = document.getElementById('statusRecording');
const exportPNG = document.getElementById('exportPNG');
const exportJPG = document.getElementById('exportJPG');
const exportStory = document.getElementById('exportStory');
const saveProject = document.getElementById('saveProject');
const loadProject = document.getElementById('loadProject');
const randomChat = document.getElementById('randomChat');
const generateStoryBtn = document.getElementById('generateStoryBtn');
const storyCategory = document.getElementById('storyCategory');
const templateBtns = document.querySelectorAll('.template-btn');
const whatsappStatusPanel = document.getElementById('whatsappStatusPanel');
const messageStatusSelect = document.getElementById('messageStatusSelect');
const editModal = document.getElementById('editModal');
const closeModal = document.getElementById('closeModal');
const saveEdit = document.getElementById('saveEdit');
const editMsgId = document.getElementById('editMsgId');
const editSender = document.getElementById('editSender');
const editText = document.getElementById('editText');
const editSide = document.getElementById('editSide');
const editTime = document.getElementById('editTime');
const editAvatar = document.getElementById('editAvatar');
const phoneScreen = document.getElementById('phoneScreen');
const chatHeader = document.getElementById('chatHeader');
const headerAvatar = document.getElementById('headerAvatar');
const headerName = document.getElementById('headerName');

// Initialize default messages
messages = [
  { id: '1', sender: 'Alex', text: 'Hey, check this out!', side: 'right', time: '14:32', avatar: 'https://i.pravatar.cc/40?img=7', status: 'read' },
  { id: '2', sender: 'Jordan', text: 'Wow, that\'s amazing! 😍', side: 'left', time: '14:33', avatar: 'https://i.pravatar.cc/40?img=4', status: 'delivered' }
];

// Apply theme on load
document.body.classList.add(`theme-${currentTheme}`);
renderMessages();

// Theme switching
themeBtns.forEach(btn => {
  btn.addEventListener('click', () => {
    const theme = btn.dataset.theme;
    setTheme(theme);
  });
});

function setTheme(theme) {
  // Remove previous theme class
  document.body.classList.forEach(cls => {
    if (cls.startsWith('theme-')) document.body.classList.remove(cls);
  });
  document.body.classList.add(`theme-${theme}`);
  currentTheme = theme;
  // Show/hide WhatsApp status panel
  whatsappStatusPanel.style.display = theme === 'whatsapp' ? 'block' : 'none';
  // Update chat background if needed
  if (theme === 'whatsapp') {
    chatMessagesDiv.style.backgroundImage = "url('https://i.imgur.com/8jq6XbX.png')"; // subtle pattern
  } else {
    chatMessagesDiv.style.backgroundImage = '';
  }
  renderMessages(); // re-render to apply status icons
}

// Dark mode toggle
darkToggle.addEventListener('click', () => {
  document.documentElement.classList.toggle('dark');
});

// Add message
addMsgBtn.addEventListener('click', () => {
  const sender = msgSender.value.trim() || 'Unknown';
  const text = msgText.value.trim();
  if (!text) return alert('Message text cannot be empty');
  const side = msgSide.value;
  let time = msgTime.value;
  if (!time) {
    const now = new Date();
    time = `${now.getHours().toString().padStart(2,'0')}:${now.getMinutes().toString().padStart(2,'0')}`;
  }
  let avatar = '';
  if (msgAvatar.files[0]) {
    const reader = new FileReader();
    reader.onload = e => {
      avatar = e.target.result;
      addMessageToState(sender, text, side, time, avatar);
    };
    reader.readAsDataURL(msgAvatar.files[0]);
  } else {
    // default avatar based on side
    avatar = side === 'left' ? 'https://i.pravatar.cc/40?img=4' : 'https://i.pravatar.cc/40?img=7';
    addMessageToState(sender, text, side, time, avatar);
  }
});

function addMessageToState(sender, text, side, time, avatar) {
  const newMsg = {
    id: Date.now() + Math.random(),
    sender,
    text,
    side,
    time,
    avatar,
    status: 'sent' // default
  };
  messages.push(newMsg);
  renderMessages();
  // Clear form
  msgSender.value = '';
  msgText.value = '';
  msgAvatar.value = '';
}

// Render messages
function renderMessages() {
  chatMessagesDiv.innerHTML = '';
  messages.forEach(msg => {
    const bubble = document.createElement('div');
    bubble.className = `message-bubble mb-3 flex ${msg.side === 'right' ? 'justify-end' : 'justify-start'}`;
    bubble.dataset.id = msg.id;
    bubble.innerHTML = `
      <div class="flex max-w-[75%] ${msg.side === 'right' ? 'flex-row-reverse' : ''} items-end gap-2">
        <img src="${msg.avatar}" class="w-8 h-8 rounded-full flex-shrink-0" alt="avatar">
        <div>
          <div class="chat-bubble ${msg.side} p-3 shadow-sm">
            <div class="font-semibold text-xs">${msg.sender}</div>
            <div>${msg.text}</div>
            <div class="flex justify-end items-center gap-1 mt-1 text-xs opacity-70">
              <span>${msg.time}</span>
              ${currentTheme === 'whatsapp' ? getStatusIcon(msg.status) : ''}
            </div>
          </div>
        </div>
      </div>
    `;
    chatMessagesDiv.appendChild(bubble);
  });
  // After rendering, make messages draggable and clickable
  makeDraggable();
  attachMessageClick();
  // Scroll to bottom
  chatMessagesDiv.scrollTop = chatMessagesDiv.scrollHeight;
}

function getStatusIcon(status) {
  if (status === 'sent') return '<span class="ml-1"><i class="fa-regular fa-check"></i></span>';
  if (status === 'delivered') return '<span class="ml-1"><i class="fa-solid fa-check-double"></i></span>';
  if (status === 'read') return '<span class="ml-1 text-blue-500"><i class="fa-solid fa-check-double"></i></span>';
  return '';
}

// Make messages draggable (vertical only) using interact.js
function makeDraggable() {
  interact('.message-bubble').draggable({
    axis: 'y',
    listeners: {
      move(event) {
        const target = event.target;
        const y = (parseFloat(target.getAttribute('data-y')) || 0) + event.dy;
        target.style.transform = `translateY(${y}px)`;
        target.setAttribute('data-y', y);
      },
      end(event) {
        // Reorder based on position? For simplicity, we just reset transform.
        // To actually reorder, we would need to compare bounding rects and swap in array.
        // We'll implement a simple version: after drag, we update the order in messages by moving the dragged item.
        const target = event.target;
        const id = target.dataset.id;
        const index = messages.findIndex(m => m.id == id);
        if (index === -1) return;

        // Get the dragged element's center Y relative to container
        const rect = target.getBoundingClientRect();
        const containerRect = chatMessagesDiv.getBoundingClientRect();
        const centerY = rect.top + rect.height/2 - containerRect.top + chatMessagesDiv.scrollTop;

        // Find which message element is closest to this Y (excluding itself)
        const messageElements = [...document.querySelectorAll('.message-bubble')];
        let newIndex = -1;
        let minDist = Infinity;
        messageElements.forEach((el, i) => {
          if (el === target) return;
          const r = el.getBoundingClientRect();
          const elCenter = r.top + r.height/2 - containerRect.top + chatMessagesDiv.scrollTop;
          const dist = Math.abs(centerY - elCenter);
          if (dist < minDist) {
            minDist = dist;
            newIndex = i;
          }
        });

        if (newIndex !== -1) {
          // Remove from old position, insert at new
          const [movedMsg] = messages.splice(index, 1);
          messages.splice(newIndex, 0, movedMsg);
        }

        // Reset transform
        target.style.transform = '';
        target.removeAttribute('data-y');
        renderMessages(); // re-render to reflect new order
      }
    }
  });
}

// Attach click to open edit modal
function attachMessageClick() {
  document.querySelectorAll('.message-bubble').forEach(el => {
    el.addEventListener('click', (e) => {
      e.stopPropagation();
      const id = el.dataset.id;
      const msg = messages.find(m => m.id == id);
      if (!msg) return;
      editingId = id;
      editMsgId.value = id;
      editSender.value = msg.sender;
      editText.value = msg.text;
      editSide.value = msg.side;
      editTime.value = msg.time;
      // avatar file input can't be pre-filled, we'll keep it optional
      editModal.classList.add('active');
    });
  });
}

// Close modal
closeModal.addEventListener('click', () => {
  editModal.classList.remove('active');
});

// Save edit
saveEdit.addEventListener('click', () => {
  const id = editMsgId.value;
  const msg = messages.find(m => m.id == id);
  if (!msg) return;
  msg.sender = editSender.value || msg.sender;
  msg.text = editText.value || msg.text;
  msg.side = editSide.value;
  msg.time = editTime.value || msg.time;
  if (editAvatar.files[0]) {
    const reader = new FileReader();
    reader.onload = e => {
      msg.avatar = e.target.result;
      renderMessages();
    };
    reader.readAsDataURL(editAvatar.files[0]);
  } else {
    renderMessages();
  }
  editModal.classList.remove('active');
});

// Status toggles
statusOnline.addEventListener('click', () => headerSubtext.innerText = 'online');
statusTyping.addEventListener('click', () => headerSubtext.innerText = 'typing...');
statusLastSeen.addEventListener('click', () => headerSubtext.innerText = 'last seen recently');
statusRecording.addEventListener('click', () => headerSubtext.innerText = 'recording audio...');

// Export functions
function exportChat(format) {
  const element = phoneScreen; // capture entire phone screen
  const scale = format === 'story' ? 2 : 1;
  const options = {
    scale: scale,
    backgroundColor: null
  };
  if (format === 'story') {
    // For story, we want 1080x1920, so we temporarily set a fixed height on the container?
    // We'll just capture and let user crop.
  }
  html2canvas(element, options).then(canvas => {
    const link = document.createElement('a');
    link.download = `chat.${format}`;
    link.href = canvas.toDataURL(`image/${format === 'jpg' ? 'jpeg' : 'png'}`);
    link.click();
  });
}
exportPNG.addEventListener('click', () => exportChat('png'));
exportJPG.addEventListener('click', () => exportChat('jpg'));
exportStory.addEventListener('click', () => {
  // For story, we might want to hide the phone frame and just capture the chat area with 9:16 aspect.
  // Simpler: capture the phoneScreen but we can scale.
  exportChat('png'); // same as png but we can rename file
  // Actually we'll set a flag: we can temporarily add a class to make the chat area tall.
  alert('For story format, export as PNG and crop to 9:16. We\'ll generate a tall version soon.');
});

// Save project to localStorage
saveProject.addEventListener('click', () => {
  const project = {
    messages,
    theme: currentTheme,
    headerName: headerName.innerText,
    headerAvatar: headerAvatar.src
  };
  localStorage.setItem('fakeChatProject', JSON.stringify(project));
  alert('Project saved!');
});

// Load project
loadProject.addEventListener('click', () => {
  const saved = localStorage.getItem('fakeChatProject');
  if (saved) {
    const project = JSON.parse(saved);
    messages = project.messages || [];
    setTheme(project.theme || 'whatsapp');
    headerName.innerText = project.headerName || 'Alex Morgan';
    headerAvatar.src = project.headerAvatar || 'https://i.pravatar.cc/40?img=7';
    renderMessages();
  } else {
    alert('No saved project');
  }
});

// Random chat generator
randomChat.addEventListener('click', () => {
  const names = ['Alice', 'Bob', 'Charlie', 'Dana', 'Eve'];
  const phrases = ['OMG 😱', 'lol', 'check this out', 'no way!', 'I can\'t believe it', 'viral!', '😂😂', '💔'];
  const count = Math.floor(Math.random() * 8) + 3;
  messages = [];
  for (let i = 0; i < count; i++) {
    messages.push({
      id: Date.now() + i,
      sender: names[Math.floor(Math.random() * names.length)],
      text: phrases[Math.floor(Math.random() * phrases.length)] + ' '.repeat(i),
      side: Math.random() > 0.5 ? 'left' : 'right',
      time: `${Math.floor(Math.random()*12)+1}:${Math.floor(Math.random()*60)}`,
      avatar: `https://i.pravatar.cc/40?img=${Math.floor(Math.random()*70)}`,
      status: ['sent','delivered','read'][Math.floor(Math.random()*3)]
    });
  }
  renderMessages();
});

// Story generator (simulated with anime.js)
const storyTemplates = {
  funny: [
    { sender: 'Friend', text: 'Why did the chicken cross the road?', side: 'left' },
    { sender: 'Me', text: 'Idk, why?', side: 'right' },
    { sender: 'Friend', text: 'To get to the other side! 😂', side: 'left' }
  ],
  drama: [
    { sender: 'Partner', text: 'We need to talk.', side: 'left' },
    { sender: 'Me', text: 'What\'s wrong?', side: 'right' },
    { sender: 'Partner', text: 'I saw your messages with...', side: 'left' },
    { sender: 'Me', text: 'It\'s not what you think!', side: 'right' }
  ],
  prank: [
    { sender: 'Prankster', text: 'Your fly is down.', side: 'left' },
    { sender: 'Me', text: 'What? No it\'s not.', side: 'right' },
    { sender: 'Prankster', text: 'Made you look! 😜', side: 'left' }
  ],
  horror: [
    { sender: '??', text: 'I\'m in your house.', side: 'left' },
    { sender: 'Me', text: 'Who is this?', side: 'right' },
    { sender: '??', text: 'Behind you.', side: 'left' }
  ],
  scam: [
    { sender: 'Unknown', text: 'You\'ve won a prize!', side: 'left' },
    { sender: 'Me', text: 'Really?', side: 'right' },
    { sender: 'Unknown', text: 'Click this link to claim.', side: 'left' },
    { sender: 'Me', text: 'Scam detected!', side: 'right' }
  ],
  motivational: [
    { sender: 'Coach', text: 'You can do it!', side: 'left' },
    { sender: 'Me', text: 'I\'m not sure...', side: 'right' },
    { sender: 'Coach', text: 'Believe in yourself! 💪', side: 'left' }
  ]
};

generateStoryBtn.addEventListener('click', () => {
  const category = storyCategory.value;
  const template = storyTemplates[category] || storyTemplates.funny;
  // Clear existing messages
  messages = [];
  renderMessages();

  // Animate sequentially with typing indicator
  let i = 0;
  function showNext() {
    if (i >= template.length) return;
    // Show typing indicator
    const typingDiv = document.getElementById('typingIndicator');
    typingDiv.classList.remove('hidden');
    setTimeout(() => {
      typingDiv.classList.add('hidden');
      // Add message
      const msg = template[i];
      const newMsg = {
        id: Date.now() + i,
        sender: msg.sender,
        text: msg.text,
        side: msg.side,
        time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        avatar: `https://i.pravatar.cc/40?img=${Math.floor(Math.random()*70)}`,
        status: 'sent'
      };
      messages.push(newMsg);
      renderMessages();
      i++;
      setTimeout(showNext, 1500 + Math.random()*1000);
    }, 2000);
  }
  showNext();
});

// Templates
templateBtns.forEach(btn => {
  btn.addEventListener('click', () => {
    const tmpl = btn.dataset.template;
    // Predefined conversations (simplified)
    if (tmpl === 'cheating') {
      messages = [
        { id: 'c1', sender: 'Girlfriend', text: 'Who were you texting last night?', side: 'left', time: '22:15', avatar: 'https://i.pravatar.cc/40?img=5' },
        { id: 'c2', sender: 'Me', text: 'Nobody, just work stuff.', side: 'right', time: '22:16', avatar: 'https://i.pravatar.cc/40?img=7' },
        { id: 'c3', sender: 'Girlfriend', text: 'I saw the messages. It\'s over.', side: 'left', time: '22:17', avatar: 'https://i.pravatar.cc/40?img=5' }
      ];
    } else if (tmpl === 'boss') {
      messages = [
        { id: 'b1', sender: 'Boss', text: 'Can you come in tomorrow?', side: 'left', time: '19:20', avatar: 'https://i.pravatar.cc/40?img=8' },
        { id: 'b2', sender: 'Me', text: 'Sure, what\'s up?', side: 'right', time: '19:21', avatar: 'https://i.pravatar.cc/40?img=7' },
        { id: 'b3', sender: 'Boss', text: 'You\'re getting a promotion!', side: 'left', time: '19:22', avatar: 'https://i.pravatar.cc/40?img=8' }
      ];
    } else if (tmpl === 'prank') {
      messages = [
        { id: 'p1', sender: 'Friend', text: 'I ate your lunch.', side: 'left', time: '12:00', avatar: 'https://i.pravatar.cc/40?img=3' },
        { id: 'p2', sender: 'Me', text: 'What?! That was my favorite!', side: 'right', time: '12:01', avatar: 'https://i.pravatar.cc/40?img=7' },
        { id: 'p3', sender: 'Friend', text: 'Just kidding, I bought you pizza 🍕', side: 'left', time: '12:02', avatar: 'https://i.pravatar.cc/40?img=3' }
      ];
    } else {
      return;
    }
    renderMessages();
  });
});

// WhatsApp status update (when adding message, we could set status from select)
messageStatusSelect.addEventListener('change', () => {
  // For simplicity, we can apply status to last message or all? We'll apply to last added.
  if (messages.length > 0) {
    messages[messages.length-1].status = messageStatusSelect.value;
    renderMessages();
  }
});

// Update header name/avatar editable? We could allow click to change.
// For simplicity, we can let user change via console or we add later.

// Initial render
renderMessages();
setTheme('whatsapp');
