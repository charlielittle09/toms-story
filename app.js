// =================================================================
// Tom's Story — app.js
// Google sign-in -> Drive-backed prompts, recording, uploads, playback
// =================================================================
(function(){
  const uid = () => Math.random().toString(36).slice(2, 10);

  // ---------------- Default content ----------------
  function mk(q){
    return { id: uid(), q, a: '', skipped: false, media: [], _wasDone: false };
  }

  function defaultData(){
    return {
      title: "Tom's Story",
      subtitle: "Gathered for the people who love him",
      activeChapter: 'c1',
      chapters: [
        { id:'c1', name:'Who Am I?', prompts:[
          mk("Tell me about the house you grew up in."),
          mk("What is one of your earliest memories?"),
          mk("What did your parents teach you without ever saying the words?"),
          mk("What was it like being the middle child?"),
          mk("Tell me about your brother and sister."),
          mk("What made you laugh as a kid?"),
          mk("What got you into trouble?"),
          mk("What were your dreams when you were ten years old?"),
          mk("What music reminds you of your teenage years?"),
          mk("What was your first real job?"),
          mk("What challenge changed you the most before adulthood?"),
        ]},
        { id:'c2', name:'Army Stories', prompts:[
          mk("Why did you decide to join the Army?"),
          mk("Tell me about the first day you put on the uniform."),
          mk("What makes a good leader?"),
          mk("Tell me about someone you served with who deserves to be remembered."),
          mk("What did Afghanistan teach you about courage?"),
          mk("What surprised you most while living overseas?"),
          mk("Tell me about a day you'll never forget."),
          mk("What did flying Apaches feel like?"),
          mk("What made you proud?"),
          mk("What scared you?"),
          mk("What lessons from the Army apply to everyday life?"),
          mk("What did serving teach you about friendship?"),
        ]},
        { id:'c3', name:'Falling In Love', prompts:[
          mk("Tell me how you met your mom."),
          mk("What was your first impression of her?"),
          mk("When did you know she was the one?"),
          mk("Tell me about Korea."),
          mk("What adventures did you have together?"),
          mk("What do you admire most about your wife?"),
          mk("What is something she does that always makes you smile?"),
          mk("What's one story about the two of you that nobody else knows?"),
        ]},
        { id:'c4', name:'Becoming Dad', prompts:[
          mk("Tell me about the day I was born."),
          mk("What were you feeling while waiting to meet me?"),
          mk("What surprised you about being a father?"),
          mk("What was your favorite age so far?"),
          mk("What are some of my funny habits you hope I never lose?"),
          mk("Tell me about a day with me that you'll never forget."),
          mk("What made you laugh the hardest because of me?"),
          mk("What are you most proud of when you think about me?"),
          mk("What do you hope I always remember about our family?"),
        ]},
        { id:'c5', name:'The Little Things', prompts:[
          mk("What's your perfect Saturday?"),
          mk("What's your favorite meal?"),
          mk("What songs should I always know?"),
          mk("Which movies make you cry?"),
          mk("What books changed your life?"),
          mk("What jokes always make you laugh?"),
          mk("What do you secretly enjoy that surprises people?"),
          mk("What smells remind you of home?"),
          mk("What's your favorite season?"),
          mk("What would your friends say about you?"),
          mk("What annoys you?"),
          mk("What are you really good at?"),
          mk("What are you terrible at?"),
        ]},
        { id:'c6', name:'Wisdom', prompts:[
          mk("What does courage actually look like?"),
          mk("How do you know who to trust?"),
          mk("How do you recover after failure?"),
          mk("What makes someone a good friend?"),
          mk("How do you apologize well?"),
          mk("How do you know when to stand your ground?"),
          mk("How do you forgive?"),
          mk("What does integrity mean?"),
          mk("What should I do when life feels unfair?"),
          mk("How do you find purpose?"),
        ]},
        { id:'c7', name:'What I Believe', prompts:[
          mk("How has your faith shaped the person you are?"),
          mk("When have you felt God's presence most clearly in your life?"),
          mk("What Bible verse or passage has carried you through difficult seasons, and why?"),
          mk("How have you seen God work in your life, even when you didn't recognize it at the time?"),
          mk("What inspired you to become the VA Chaplain?"),
          mk("What do you believe makes someone a person of integrity?"),
          mk("What does courage look like in everyday life?"),
          mk("What's something you've changed your mind about over the years?"),
          mk("What are you most grateful for, and why?"),
          mk("What do you believe makes for a meaningful and joyful life?"),
          mk("What do you hope our family keeps doing for generations?"),
        ]},
        { id:'c8', name:'The Fun Stuff', prompts:[
          mk("Your favorite dad jokes."),
          mk("Family recipes."),
          mk("The \"right\" way to grill a steak."),
          mk("How to pack for a trip."),
          mk("How to change a tire."),
          mk("Your fantasy football advice."),
          mk("Best Chicago pizza debate."),
          mk("Your coffee order."),
          mk("Your signature dance move."),
          mk("Five songs everyone should blast in the car."),
        ]},
      ],
      monthly: [
        { id:'m1', label:'Tell me one story about this week.', entries: [] },
        { id:'m2', label:'Finish this sentence: "I love when Faith\u2026"', entries: [] },
      ]
    };
  }

  // ---------------- State ----------------
  let data = null;
  let storyFileId = null;
  let accessToken = null;
  let currentUserEmail = null;
  let tokenClient = null;
  let view = 'capture';
  const blobUrlCache = new Map();

  // ---------------- Utilities ----------------
  function debounce(fn, wait){
    let t;
    return (...args) => { clearTimeout(t); t = setTimeout(() => fn(...args), wait); };
  }
  function escapeHtml(s){
    const d = document.createElement('div');
    d.textContent = s;
    return d.innerHTML;
  }
  function setSaveStatus(text){
    const el = document.getElementById('saveStatus');
    if (el) el.textContent = text;
  }
  function isDone(p){
    return (p.a && p.a.trim().length > 0) || (p.media && p.media.length > 0);
  }

  // ---------------- Auth ----------------
  function initAuth(){
    tokenClient = google.accounts.oauth2.initTokenClient({
      client_id: CONFIG.GOOGLE_CLIENT_ID,
      scope: CONFIG.DRIVE_SCOPES,
      callback: '' // set per-request below
    });
  }

  function requestAccessToken(interactive){
    return new Promise((resolve, reject) => {
      tokenClient.callback = (resp) => {
        if (resp.error){ reject(resp); return; }
        accessToken = resp.access_token;
        resolve(resp);
      };
      tokenClient.requestAccessToken({ prompt: interactive ? 'consent' : '' });
    });
  }

  async function fetchUserEmail(){
    const res = await fetch('https://www.googleapis.com/oauth2/v3/userinfo', {
      headers: { Authorization: 'Bearer ' + accessToken }
    });
    const json = await res.json();
    return json.email;
  }

  async function handleSignIn(){
    const btn = document.getElementById('signInBtn');
    if (btn) btn.disabled = true;
    try{
      await requestAccessToken(true);
      const email = await fetchUserEmail();
      if (!CONFIG.ALLOWED_EMAILS.includes(email)){
        showNotAllowed(email);
        return;
      }
      currentUserEmail = email;
      await loadStoryData();
      showApp();
      renderAll();
    }catch(e){
      console.error(e);
      alert('Sign-in did not go through. Please try again.');
    }finally{
      if (btn) btn.disabled = false;
    }
  }

  function showNotAllowed(email){
    document.getElementById('notAllowedBox').style.display = 'block';
    document.getElementById('notAllowedEmail').textContent = email;
  }

  function handleSignOut(){
    if (accessToken){
      google.accounts.oauth2.revoke(accessToken, () => {});
    }
    location.reload();
  }

  // ---------------- Drive helpers ----------------
  async function driveFetch(url, options){
    options = options || {};
    options.headers = Object.assign({}, options.headers, { Authorization: 'Bearer ' + accessToken });
    let res = await fetch(url, options);
    if (res.status === 401){
      await requestAccessToken(false);
      options.headers.Authorization = 'Bearer ' + accessToken;
      res = await fetch(url, options);
    }
    if (!res.ok){
      const text = await res.text().catch(() => '');
      throw new Error('Drive API error ' + res.status + ': ' + text);
    }
    return res;
  }

  async function findDataFile(){
    const q = encodeURIComponent(`name='story-data.json' and '${CONFIG.ROOT_FOLDER_ID}' in parents and trashed=false`);
    const res = await driveFetch(`https://www.googleapis.com/drive/v3/files?q=${q}&fields=files(id,name)`);
    const json = await res.json();
    return (json.files && json.files[0]) ? json.files[0].id : null;
  }

  async function createEmptyJsonFile(name, parentId){
    const res = await driveFetch('https://www.googleapis.com/drive/v3/files?fields=id', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ name, parents: [parentId], mimeType: 'application/json' })
    });
    return (await res.json()).id;
  }

  async function writeJsonContent(fileId, obj){
    await driveFetch(`https://www.googleapis.com/upload/drive/v3/files/${fileId}?uploadType=media`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(obj)
    });
  }

  async function readJsonContent(fileId){
    const res = await driveFetch(`https://www.googleapis.com/drive/v3/files/${fileId}?alt=media`);
    return res.json();
  }

  async function uploadMediaBlob(blob, filename, parentId){
    const metadata = { name: filename, parents: [parentId] };
    const form = new FormData();
    form.append('metadata', new Blob([JSON.stringify(metadata)], { type: 'application/json' }));
    form.append('file', blob);
    const res = await driveFetch('https://www.googleapis.com/upload/drive/v3/files?uploadType=multipart&fields=id,name,mimeType', {
      method: 'POST',
      body: form
    });
    return res.json();
  }

  async function downloadMediaBlob(fileId){
    const res = await driveFetch(`https://www.googleapis.com/drive/v3/files/${fileId}?alt=media`);
    return res.blob();
  }

  function folderForChapter(chapterId){
    return (CONFIG.CHAPTER_FOLDERS && CONFIG.CHAPTER_FOLDERS[chapterId]) || CONFIG.ROOT_FOLDER_ID;
  }

  // ---------------- Data load/save ----------------
  const debouncedSave = debounce(async () => {
    setSaveStatus('Saving…');
    try{
      await writeJsonContent(storyFileId, data);
      setSaveStatus('Saved');
    }catch(e){
      console.error(e);
      setSaveStatus('Could not save — check connection');
    }
    setTimeout(() => setSaveStatus('\u00A0'), 1500);
  }, 800);

  async function saveDataNow(){
    try{ await writeJsonContent(storyFileId, data); }
    catch(e){ console.error('save failed', e); setSaveStatus('Could not save — check connection'); }
  }

  async function loadStoryData(){
    storyFileId = await findDataFile();
    if (!storyFileId){
      data = defaultData();
      storyFileId = await createEmptyJsonFile('story-data.json', CONFIG.ROOT_FOLDER_ID);
      await writeJsonContent(storyFileId, data);
    } else {
      data = await readJsonContent(storyFileId);
      if (!data.monthly) data.monthly = defaultData().monthly;
      data.chapters.forEach(ch => ch.prompts.forEach(p => {
        if (!p.media) p.media = [];
        if (typeof p.skipped === 'undefined') p.skipped = false;
        p._wasDone = isDone(p);
      }));
    }
  }

  // ---------------- Progress ----------------
  function progress(){
    let total = 0, done = 0, skipped = 0;
    data.chapters.forEach(ch => ch.prompts.forEach(p => {
      total++;
      if (isDone(p)) done++;
      else if (p.skipped) skipped++;
    }));
    return { total, done, skipped };
  }
  function updateProgressUI(){
    const { total, done, skipped } = progress();
    let label = `${done} of ${total} memories captured`;
    if (skipped > 0) label += ` · ${skipped} set aside for now`;
    document.getElementById('progressLabel').textContent = label;
    document.getElementById('ribbonFill').style.width = total ? `${Math.round(done/total*100)}%` : '0%';
  }
  const updateProgressUIDebounced = debounce(updateProgressUI, 200);
  function chapterCount(ch){
    return `${ch.prompts.filter(isDone).length}/${ch.prompts.length}`;
  }

  // ---------------- Recording ----------------
  function pickSupportedMimeType(kind){
    const candidates = kind === 'audio'
      ? ['audio/webm;codecs=opus', 'audio/webm', 'audio/mp4']
      : ['video/webm;codecs=vp9,opus', 'video/webm;codecs=vp8,opus', 'video/webm', 'video/mp4'];
    return candidates.find(c => window.MediaRecorder && MediaRecorder.isTypeSupported(c)) || '';
  }

  function openRecorder(chapter, p, kind, hostEl){
    const existing = hostEl.querySelector('.recorder-panel');
    if (existing){ existing.remove(); return; }

    const panel = document.createElement('div');
    panel.className = 'recorder-panel';
    hostEl.appendChild(panel);

    const constraints = kind === 'audio' ? { audio: true } : { audio: true, video: true };
    navigator.mediaDevices.getUserMedia(constraints).then(stream => {
      let liveVideo = null;
      if (kind === 'video'){
        liveVideo = document.createElement('video');
        liveVideo.className = 'recorder-video';
        liveVideo.autoplay = true; liveVideo.muted = true; liveVideo.playsInline = true;
        liveVideo.srcObject = stream;
        panel.appendChild(liveVideo);
      }
      const timer = document.createElement('div');
      timer.className = 'recorder-timer';
      timer.textContent = 'Recording… 0:00';
      panel.appendChild(timer);

      const actions = document.createElement('div');
      actions.className = 'recorder-actions';
      const stopBtn = document.createElement('button');
      stopBtn.className = 'capture-btn';
      stopBtn.textContent = '⏹ Stop';
      const cancelBtn = document.createElement('button');
      cancelBtn.className = 'capture-btn';
      cancelBtn.textContent = 'Cancel';
      actions.appendChild(stopBtn);
      actions.appendChild(cancelBtn);
      panel.appendChild(actions);

      const mimeType = pickSupportedMimeType(kind);
      const recorder = new MediaRecorder(stream, mimeType ? { mimeType } : undefined);
      const chunks = [];
      let seconds = 0;
      const tick = setInterval(() => {
        seconds++;
        const m = Math.floor(seconds/60), s = seconds%60;
        timer.textContent = `Recording… ${m}:${s.toString().padStart(2,'0')}`;
      }, 1000);

      recorder.ondataavailable = e => { if (e.data.size > 0) chunks.push(e.data); };

      function cleanupStream(){
        stream.getTracks().forEach(t => t.stop());
        clearInterval(tick);
      }

      cancelBtn.addEventListener('click', () => {
        try{ recorder.stop(); }catch(e){}
        cleanupStream();
        panel.remove();
      });

      recorder.onstop = () => {
        cleanupStream();
        const blob = new Blob(chunks, { type: mimeType || (kind === 'audio' ? 'audio/webm' : 'video/webm') });
        const url = URL.createObjectURL(blob);
        panel.innerHTML = '';

        const preview = document.createElement(kind === 'audio' ? 'audio' : 'video');
        preview.className = 'recorder-video';
        preview.controls = true;
        preview.src = url;
        panel.appendChild(preview);

        const saveRow = document.createElement('div');
        saveRow.className = 'recorder-actions';
        const saveBtn = document.createElement('button');
        saveBtn.className = 'capture-btn';
        saveBtn.textContent = '💾 Save to Drive';
        const discardBtn = document.createElement('button');
        discardBtn.className = 'capture-btn';
        discardBtn.textContent = '🗑 Discard, try again';
        saveRow.appendChild(saveBtn);
        saveRow.appendChild(discardBtn);
        panel.appendChild(saveRow);

        const status = document.createElement('div');
        status.className = 'upload-status';
        panel.appendChild(status);

        discardBtn.addEventListener('click', () => { panel.remove(); });

        saveBtn.addEventListener('click', async () => {
          saveBtn.disabled = true; discardBtn.disabled = true;
          status.textContent = 'Uploading…';
          try{
            const ext = kind === 'audio' ? 'webm' : 'webm';
            const filename = `${chapter.name} - ${p.q.slice(0,40)} - ${Date.now()}.${ext}`.replace(/[/\\]/g,'-');
            const uploaded = await uploadMediaBlob(blob, filename, folderForChapter(chapter.id));
            p.media.push({ id: uid(), kind, driveFileId: uploaded.id, name: filename });
            p.skipped = false;
            await saveDataNow();
            panel.remove();
            renderAll();
          }catch(e){
            console.error(e);
            status.textContent = 'Upload failed — check connection and try again.';
            saveBtn.disabled = false; discardBtn.disabled = false;
          }
        });
      };

      recorder.start();
      panel._recorder = recorder;
      stopBtn.addEventListener('click', () => recorder.stop());
    }).catch(err => {
      console.error(err);
      panel.innerHTML = '<div class="upload-status" style="color:#a33;">Could not access the camera/microphone. You can still use "Upload a file" to add something recorded on your phone.</div>';
    });
  }

  function handleFileUpload(chapter, p, fileList, hostEl){
    const status = document.createElement('div');
    status.className = 'upload-status';
    status.textContent = `Uploading ${fileList.length} file(s)…`;
    hostEl.appendChild(status);

    const uploads = Array.from(fileList).map(async file => {
      const kind = file.type.startsWith('image') ? 'photo'
        : file.type.startsWith('video') ? 'video'
        : file.type.startsWith('audio') ? 'audio' : 'file';
      const uploaded = await uploadMediaBlob(file, file.name, folderForChapter(chapter.id));
      p.media.push({ id: uid(), kind, driveFileId: uploaded.id, name: file.name });
    });

    Promise.all(uploads).then(async () => {
      p.skipped = false;
      await saveDataNow();
      renderAll();
    }).catch(e => {
      console.error(e);
      status.textContent = 'Some uploads failed — check connection and try again.';
    });
  }

  async function playMedia(m, chip){
    const existingPlayer = chip.querySelector('.chip-player');
    if (existingPlayer){ existingPlayer.remove(); return; }
    let url = blobUrlCache.get(m.driveFileId);
    if (!url){
      try{
        const blob = await downloadMediaBlob(m.driveFileId);
        url = URL.createObjectURL(blob);
        blobUrlCache.set(m.driveFileId, url);
      }catch(e){
        console.error(e);
        alert('Could not load that file from Drive right now.');
        return;
      }
    }
    let player;
    if (m.kind === 'photo'){
      player = document.createElement('img');
    } else {
      player = document.createElement(m.kind === 'audio' ? 'audio' : 'video');
      player.controls = true;
    }
    player.className = 'chip-player';
    player.src = url;
    chip.appendChild(player);
  }

  function renderMediaList(p, container, opts){
    opts = opts || {};
    container.innerHTML = '';
    p.media.forEach(m => {
      const chip = document.createElement('div');
      chip.className = 'media-chip';
      const row = document.createElement('div');
      row.className = 'media-chip-row';
      const icon = m.kind === 'video' ? '🎥' : m.kind === 'audio' ? '🎙️' : m.kind === 'photo' ? '📷' : '📄';
      const label = document.createElement('span');
      label.textContent = `${icon} ${m.name}`;
      const btnGroup = document.createElement('div');
      const playBtn = document.createElement('button');
      playBtn.className = 'chip-btn'; playBtn.textContent = 'Play';
      playBtn.addEventListener('click', () => playMedia(m, chip));
      btnGroup.appendChild(playBtn);
      if (!opts.readOnly){
        const delBtn = document.createElement('button');
        delBtn.className = 'chip-btn'; delBtn.textContent = '✕';
        delBtn.style.marginLeft = '6px';
        delBtn.addEventListener('click', async () => {
          if (confirm('Remove from this list? (The file stays safe in Drive, just unlinked here.)')){
            p.media = p.media.filter(x => x.id !== m.id);
            await saveDataNow();
            renderAll();
          }
        });
        btnGroup.appendChild(delBtn);
      }
      row.appendChild(label); row.appendChild(btnGroup);
      chip.appendChild(row);
      container.appendChild(chip);
    });
  }

  // ---------------- Card building ----------------
  function buildCard(chapter, p, opts){
    opts = opts || {};
    const card = document.createElement('div');
    card.className = 'card' + (p.skipped && !isDone(p) ? ' skipped' : '');

    const stamp = document.createElement('div');
    stamp.className = 'stamp' + (isDone(p) ? ' show' : '');
    stamp.textContent = 'Captured';

    if (opts.spotlight){
      const eyebrow = document.createElement('div');
      eyebrow.className = 'spotlight-eyebrow';
      eyebrow.textContent = chapter.name;
      card.appendChild(eyebrow);
    }

    const top = document.createElement('div');
    top.className = 'card-top';
    const q = document.createElement('div');
    q.className = 'question'; q.contentEditable = 'true'; q.spellcheck = false;
    q.textContent = p.q;
    q.addEventListener('blur', () => { p.q = q.textContent.trim(); debouncedSave(); renderNav(); });
    top.appendChild(q);
    top.appendChild(stamp);

    const btns = document.createElement('div');
    btns.className = 'card-btns';
    const skipBtn = document.createElement('button');
    skipBtn.className = 'icon-btn skip';
    skipBtn.textContent = p.skipped ? '↺ bring back' : '⏭ skip for now';
    skipBtn.addEventListener('click', async () => { p.skipped = !p.skipped; await saveDataNow(); renderAll(); });
    const rm = document.createElement('button');
    rm.className = 'icon-btn remove';
    rm.textContent = '✕ remove';
    rm.addEventListener('click', async () => {
      if (confirm('Remove this question? Any answer or recordings linked to it will be unlinked (files stay safe in Drive).')){
        chapter.prompts = chapter.prompts.filter(x => x.id !== p.id);
        await saveDataNow(); renderAll();
      }
    });
    btns.appendChild(skipBtn); btns.appendChild(rm);
    top.appendChild(btns);
    card.appendChild(top);

    const answer = document.createElement('textarea');
    answer.className = 'answer';
    answer.placeholder = 'Type your answer here, or capture a recording below';
    answer.value = p.a;
    answer.addEventListener('input', () => {
      p.a = answer.value;
      if (p.a.trim()) p.skipped = false;
      debouncedSave();
      refreshStamp(p, stamp);
      updateProgressUIDebounced();
    });
    card.appendChild(answer);

    const row = document.createElement('div');
    row.className = 'capture-row';

    const recVideoBtn = document.createElement('button');
    recVideoBtn.className = 'capture-btn'; recVideoBtn.textContent = '🎥 Record video';
    recVideoBtn.addEventListener('click', () => openRecorder(chapter, p, 'video', card));

    const recAudioBtn = document.createElement('button');
    recAudioBtn.className = 'capture-btn'; recAudioBtn.textContent = '🎙️ Record audio';
    recAudioBtn.addEventListener('click', () => openRecorder(chapter, p, 'audio', card));

    const uploadBtn = document.createElement('button');
    uploadBtn.className = 'capture-btn'; uploadBtn.textContent = '📎 Upload photo or video';
    const fileInput = document.createElement('input');
    fileInput.type = 'file'; fileInput.className = 'file-input-hidden';
    fileInput.accept = 'image/*,video/*,audio/*'; fileInput.multiple = true;
    fileInput.addEventListener('change', () => {
      if (fileInput.files.length) handleFileUpload(chapter, p, fileInput.files, card);
      fileInput.value = '';
    });
    uploadBtn.addEventListener('click', () => fileInput.click());

    row.appendChild(recVideoBtn); row.appendChild(recAudioBtn); row.appendChild(uploadBtn); row.appendChild(fileInput);
    card.appendChild(row);

    const mediaList = document.createElement('div');
    mediaList.className = 'media-list';
    renderMediaList(p, mediaList);
    card.appendChild(mediaList);

    return card;
  }

  function refreshStamp(p, stampEl){
    const done = isDone(p);
    if (done && !p._wasDone){
      stampEl.classList.add('show', 'pop');
      setTimeout(() => stampEl.classList.remove('pop'), 450);
    } else if (!done){
      stampEl.classList.remove('show');
    } else {
      stampEl.classList.add('show');
    }
    p._wasDone = done;
  }

  // ---------------- Views ----------------
  function findNextUp(){
    for (const ch of data.chapters) for (const p of ch.prompts) if (!isDone(p) && !p.skipped) return { chapter: ch, prompt: p };
    for (const ch of data.chapters) for (const p of ch.prompts) if (!isDone(p)) return { chapter: ch, prompt: p };
    return null;
  }

  function renderSpotlight(){
    const wrap = document.getElementById('spotlightWrap');
    wrap.innerHTML = '';
    const heading = document.createElement('h2');
    heading.className = 'section-heading';
    heading.textContent = 'Up Next';
    wrap.appendChild(heading);

    const next = findNextUp();
    if (!next){
      const doneBox = document.createElement('div');
      doneBox.className = 'spotlight';
      doneBox.innerHTML = '<div class="all-caught-up">Every question has been answered or set aside — take a look at "The Story So Far," or check in on the Every Month prompts.</div>';
      wrap.appendChild(doneBox);
      return;
    }
    const spot = document.createElement('div');
    spot.className = 'spotlight';
    spot.appendChild(buildCard(next.chapter, next.prompt, { spotlight: true }));
    const actions = document.createElement('div');
    actions.className = 'spotlight-actions';
    const nextBtn = document.createElement('button');
    nextBtn.className = 'ghost-btn'; nextBtn.textContent = 'Show a different question →';
    nextBtn.addEventListener('click', renderSpotlight);
    actions.appendChild(nextBtn);
    spot.appendChild(actions);
    wrap.appendChild(spot);
  }

  function renderNav(){
    const nav = document.getElementById('chapterNav');
    nav.innerHTML = '';
    data.chapters.forEach(ch => {
      const btn = document.createElement('button');
      btn.className = 'chapter-tab' + (ch.id === data.activeChapter ? ' active' : '');
      btn.innerHTML = `${escapeHtml(ch.name)} <span class="count">${chapterCount(ch)}</span>`;
      btn.addEventListener('click', async () => {
        data.activeChapter = ch.id;
        await saveDataNow();
        renderNav(); renderCapture();
      });
      nav.appendChild(btn);
    });
  }

  function renderCapture(){
    const container = document.getElementById('captureView');
    container.innerHTML = '';
    const chapter = data.chapters.find(c => c.id === data.activeChapter) || data.chapters[0];
    chapter.prompts.forEach(p => container.appendChild(buildCard(chapter, p, {})));
    const addBtn = document.createElement('button');
    addBtn.className = 'add-prompt'; addBtn.textContent = '+ Add a question';
    addBtn.addEventListener('click', async () => {
      chapter.prompts.push(mk('A new question…'));
      await saveDataNow(); renderAll();
    });
    container.appendChild(addBtn);
  }

  function renderMonthly(){
    const container = document.getElementById('monthlyView');
    container.innerHTML = '';
    data.monthly.forEach(m => {
      const card = document.createElement('div');
      card.className = 'monthly-card';
      const q = document.createElement('div');
      q.className = 'monthly-q'; q.textContent = m.label;
      card.appendChild(q);

      const form = document.createElement('div');
      form.className = 'monthly-form';
      const dateInput = document.createElement('input');
      dateInput.type = 'date'; dateInput.valueAsDate = new Date();
      const textInput = document.createElement('textarea');
      textInput.placeholder = 'Write it here, or note that it was recorded instead…';
      const addBtn = document.createElement('button');
      addBtn.className = 'monthly-form-btn'; addBtn.textContent = 'Add entry';
      addBtn.addEventListener('click', async () => {
        if (!textInput.value.trim()) return;
        m.entries.unshift({ id: uid(), date: dateInput.value || new Date().toISOString().slice(0,10), text: textInput.value.trim() });
        await saveDataNow(); renderMonthly();
      });
      form.appendChild(dateInput); form.appendChild(textInput); form.appendChild(addBtn);
      card.appendChild(form);

      const entries = document.createElement('div');
      entries.className = 'monthly-entries';
      if (!m.entries.length){
        entries.innerHTML = '<div class="monthly-empty">No entries yet.</div>';
      } else {
        m.entries.forEach(e => {
          const row = document.createElement('div');
          row.className = 'monthly-entry';
          const del = document.createElement('button');
          del.className = 'monthly-entry-del'; del.textContent = '✕';
          del.addEventListener('click', async () => {
            m.entries = m.entries.filter(x => x.id !== e.id);
            await saveDataNow(); renderMonthly();
          });
          const d = document.createElement('div');
          d.className = 'monthly-entry-date'; d.textContent = e.date;
          const t = document.createElement('div');
          t.className = 'monthly-entry-text'; t.textContent = e.text;
          row.appendChild(del); row.appendChild(d); row.appendChild(t);
          entries.appendChild(row);
        });
      }
      card.appendChild(entries);
      container.appendChild(card);
    });
  }

  function renderRead(){
    const container = document.getElementById('readView');
    container.innerHTML = '';
    const { done } = progress();
    const anyMonthly = data.monthly.some(m => m.entries.length);
    if (done === 0 && !anyMonthly){
      container.innerHTML = '<div class="empty-note">Nothing captured yet — answers will appear here as they\'re filled in.</div>';
      return;
    }
    data.chapters.forEach(ch => {
      const filled = ch.prompts.filter(isDone);
      if (!filled.length) return;
      const section = document.createElement('div');
      section.className = 'read-chapter';
      const h2 = document.createElement('h2'); h2.textContent = ch.name;
      section.appendChild(h2);
      filled.forEach(p => {
        const entry = document.createElement('div');
        entry.className = 'read-entry';
        const qEl = document.createElement('div'); qEl.className = 'read-q'; qEl.textContent = p.q;
        entry.appendChild(qEl);
        if (p.a && p.a.trim()){
          const aEl = document.createElement('div');
          aEl.className = 'read-a'; aEl.textContent = p.a;
          entry.appendChild(aEl);
        }
        if (p.media && p.media.length){
          const mediaWrap = document.createElement('div');
          mediaWrap.className = 'media-list';
          renderMediaList(p, mediaWrap, { readOnly: true });
          entry.appendChild(mediaWrap);
        }
        section.appendChild(entry);
      });
      container.appendChild(section);
    });
    if (anyMonthly){
      const section = document.createElement('div');
      section.className = 'read-chapter';
      const h2 = document.createElement('h2'); h2.textContent = 'Every Month';
      section.appendChild(h2);
      data.monthly.forEach(m => m.entries.forEach(e => {
        const entry = document.createElement('div');
        entry.className = 'read-entry';
        const qEl = document.createElement('div'); qEl.className = 'read-q'; qEl.textContent = m.label + ' — ' + e.date;
        entry.appendChild(qEl);
        const aEl = document.createElement('div'); aEl.className = 'read-a'; aEl.textContent = e.text;
        entry.appendChild(aEl);
        section.appendChild(entry);
      }));
      container.appendChild(section);
    }
  }

  function setView(v){
    view = v;
    document.getElementById('btnCapture').classList.toggle('active', v === 'capture');
    document.getElementById('btnMonthly').classList.toggle('active', v === 'monthly');
    document.getElementById('btnRead').classList.toggle('active', v === 'read');
    document.getElementById('captureView').style.display = v === 'capture' ? 'block' : 'none';
    document.getElementById('spotlightWrap').style.display = v === 'capture' ? 'block' : 'none';
    document.getElementById('chapterNav').style.display = v === 'capture' ? 'flex' : 'none';
    document.getElementById('monthlyView').style.display = v === 'monthly' ? 'block' : 'none';
    document.getElementById('readView').style.display = v === 'read' ? 'block' : 'none';
    if (v === 'read') renderRead();
    if (v === 'monthly') renderMonthly();
  }

  function renderAll(){
    renderSpotlight(); renderNav(); renderCapture(); updateProgressUI();
  }

  function showApp(){
    document.getElementById('signInScreen').style.display = 'none';
    document.getElementById('appRoot').style.display = 'block';
    document.getElementById('titleEl').textContent = data.title;
    document.getElementById('subtitleEl').textContent = data.subtitle;
    document.getElementById('userEmailLabel').textContent = currentUserEmail;
  }

  // ---------------- Init ----------------
  function init(){
    initAuth();
    document.getElementById('signInBtn').addEventListener('click', handleSignIn);
    document.getElementById('signOutBtn').addEventListener('click', handleSignOut);
    document.getElementById('tryAgainBtn').addEventListener('click', () => location.reload());

    document.getElementById('titleEl').addEventListener('blur', (e) => {
      data.title = e.target.textContent.trim() || "Tom's Story";
      debouncedSave();
    });
    document.getElementById('subtitleEl').addEventListener('blur', (e) => {
      data.subtitle = e.target.textContent.trim();
      debouncedSave();
    });
    document.getElementById('btnCapture').addEventListener('click', () => setView('capture'));
    document.getElementById('btnMonthly').addEventListener('click', () => setView('monthly'));
    document.getElementById('btnRead').addEventListener('click', () => setView('read'));
  }

  window.addEventListener('DOMContentLoaded', init);
})();
