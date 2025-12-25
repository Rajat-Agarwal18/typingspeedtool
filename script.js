
alert("welcome to speedtype pro");
document.addEventListener('DOMContentLoaded', function() {
    // DOM Elements (const=variable can't be re declared or updated.a block scope variable)
    const sampleText = document.getElementById('sample-text');
    const typingArea = document.getElementById('typing-area');
    const wpmDisplay = document.getElementById('wpm');
    const accuracyDisplay = document.getElementById('accuracy');
    const timeDisplay = document.getElementById('time');
    const errorsDisplay = document.getElementById('errors');
    const restartBtn = document.getElementById('restart-btn');
    const toggleBackspaceBtn = document.getElementById('toggle-backspace');
    const backspaceWarning = document.getElementById('backspace-warning');
    const time15Btn = document.getElementById('time-15');
    const time30Btn = document.getElementById('time-30');
    const time60Btn = document.getElementById('time-60');
    const time120Btn = document.getElementById('time-120');
    const time300Btn = document.getElementById('time-300');
    const optionCards = document.querySelectorAll('.option-card');
    const difficultyBtns = document.querySelectorAll('.difficulty-btn');
    const resultsModal = document.getElementById('results-modal');
    const modalWpm = document.getElementById('modal-wpm');
    const modalAccuracy = document.getElementById('modal-accuracy');
    const modalChars = document.getElementById('modal-chars');
    const modalErrors = document.getElementById('modal-errors');
    const modalRestart = document.getElementById('modal-restart');
    const modalShare = document.getElementById('modal-share');
    const darkModeToggle = document.getElementById('dark-mode-toggle');

    // Variables (let= variable can't be re declared but can be updated.a block scope variable)
    let timer;
    let selectedTime = 60;
    let timeLeft = selectedTime;
    let isTyping = false;  //boolean if we are typing then it will be true otherwise false
    let correctCharacters = 0;
    let totalCharacters = 0;
    let errorCount = 0;
    let startTime;
    let currentDifficulty = 'easy';
    let originalText = sampleText.textContent;
    let currentWordIndex = 0;
    let words = originalText.split(' ');
    let backspaceDisabled = false;

    // Initialize
    updateTimeDisplay();
    highlightCurrentWord();
    loadTextBasedOnDifficulty();

    // Event Listeners
    typingArea.addEventListener('input', handleTyping);
    typingArea.addEventListener('keydown', handleKeyDown);
    restartBtn.addEventListener('click', resetTest);
    toggleBackspaceBtn.addEventListener('click', toggleBackspace);

    // Fixed: Pass event to setTime
    time30Btn.addEventListener('click', (e) => setTime(30, e));
    time60Btn.addEventListener('click', (e) => setTime(60, e));
    time120Btn.addEventListener('click', (e) => setTime(120, e));
    time300Btn.addEventListener('click', (e) => setTime(300, e));

    modalRestart.addEventListener('click', () => {
            resultsModal.style.display = 'none';
            resetTest();
        });

    modalShare.addEventListener('click', shareResults);
    darkModeToggle.addEventListener('click', toggleDarkMode);

    resultsModal.addEventListener('click', (e) => {
            if (e.target === resultsModal) {
                resultsModal.style.display = 'none';
            }
        });

    optionCards.forEach(card => {
        card.addEventListener('click', () => {
            const newText = card.getAttribute('data-text');
            originalText = newText;
            sampleText.textContent = newText;
            words = newText.split(' ');
            resetTest();
            highlightCurrentWord();

            card.style.transform = 'scale(0.95)';
            setTimeout(() => {
                card.style.transform = '';
            }, 150);
        });
    });

    difficultyBtns.forEach(btn => {
        btn.addEventListener('click', () => {
            difficultyBtns.forEach(b => b.classList.remove('active'));
            btn.classList.add('active');
            currentDifficulty = btn.getAttribute('data-difficulty');
            loadTextBasedOnDifficulty();
            resetTest();
        });
    });

    document.querySelectorAll('nav a[href^="#"]').forEach((anchor) => {
        anchor.addEventListener('click', function (e) {
            e.preventDefault();
            const target = document.querySelector(this.getAttribute('href'));
            if (target) {
                target.scrollIntoView({ behavior: 'smooth', block: 'start' });
            }
        });
    });//arrow funtion me pure function ko kisi variable me store krva skte hai yeh kisi funtion ko short me likhne ka ek tarika hai

    // Functions
    function setTime(seconds, event) {
        selectedTime = seconds;
        timeLeft = seconds;

        document.querySelectorAll('.control-group .btn-outline').forEach(btn => {
            btn.classList.remove('active');
        });

        if (event?.target) {
            event.target.classList.add('active');
        }

        updateTimeDisplay();
        resetTest();
    }

    function resetTest() {
        clearInterval(timer);
        isTyping = false;
        timeLeft = selectedTime;
        updateTimeDisplay();
        typingArea.value = '';
        wpmDisplay.textContent = '0';
        accuracyDisplay.textContent = '0%';
        errorsDisplay.textContent = '0';
        correctCharacters = 0;
        totalCharacters = 0;
        errorCount = 0;
        currentWordIndex = 0;
        highlightCurrentWord();
        typingArea.focus();
        backspaceWarning.classList.remove('show');
    }

    function handleKeyDown(e) {
        if (backspaceDisabled && e.key === 'Backspace') {
            e.preventDefault();
            showBackspaceWarning();
            return false;
        }
    }

    function handleTyping() {
        if (!isTyping) {
            isTyping = true;
            startTime = new Date();
            startTimer();
        }

        const typedText = typingArea.value;
        const sampleTextContent = sampleText.textContent;

        correctCharacters = 0;
        errorCount = 0;
        totalCharacters = typedText.length;

        for (let i = 0; i < typedText.length; i++) {
            if (typedText[i] === sampleTextContent[i]) {
                correctCharacters++;
            } else {
                errorCount++;
            }
        }

        const timeElapsed = (new Date() - startTime) / 60000;
        const wpm = timeElapsed > 0 ? Math.round((correctCharacters / 5) / timeElapsed) : 0;
        const accuracy = totalCharacters > 0 ? Math.round((correctCharacters / totalCharacters) * 100) : 0;

        wpmDisplay.textContent = wpm;
        accuracyDisplay.textContent = accuracy + '%';
        errorsDisplay.textContent = errorCount;

        highlightCurrentWord();

        if (typedText.length === sampleTextContent.length) {
            finishTest();
        }
    }

    function toggleBackspace() {
        backspaceDisabled = !backspaceDisabled;

        if (backspaceDisabled) {
            toggleBackspaceBtn.innerHTML = '<i class="fas fa-check"></i> Enable Backspace';
            toggleBackspaceBtn.classList.remove('btn-warning');
            toggleBackspaceBtn.classList.add('btn-primary');
            typingArea.classList.add('backspace-disabled');
            showBackspaceWarning();
        } else {
            toggleBackspaceBtn.innerHTML = '<i class="fas fa-ban"></i> Disable Backspace';
            toggleBackspaceBtn.classList.remove('btn-primary');
            toggleBackspaceBtn.classList.add('btn-warning');
            typingArea.classList.remove('backspace-disabled');
            backspaceWarning.classList.remove('show');
        }
    }

    function showBackspaceWarning() {
        backspaceWarning.classList.add('show');
        setTimeout(() => {
            backspaceWarning.classList.remove('show');
        }, 3000);
    }

    function startTimer() {
        clearInterval(timer);
        timer = setInterval(() => {
            timeLeft--;
            updateTimeDisplay();

            if (timeLeft <= 0) {
                finishTest();
            }
        }, 1000);
    }

    function updateTimeDisplay() {
        const minutes = Math.floor(timeLeft / 60);
        const seconds = timeLeft % 60;
        if (minutes > 0) {
            timeDisplay.textContent = `${minutes}:${seconds.toString().padStart(2, '0')}`;//ek sth print kr skte hai baar baar ("")inka use nhi hoga
        } else {
            timeDisplay.textContent = timeLeft + 's';
        }
    }

    function finishTest() {
        clearInterval(timer);
        isTyping = false;

        const originalTimeLimit = selectedTime;
        const timeElapsed = originalTimeLimit - timeLeft;
        const minutes = timeElapsed / 60;
        const wpm = minutes > 0 ? Math.round((correctCharacters / 5) / minutes) : 0;
        const accuracy = totalCharacters > 0 ? Math.round((correctCharacters / totalCharacters) * 100) : 0;

        modalWpm.textContent = wpm;
        modalAccuracy.textContent = accuracy + '%';
        modalChars.textContent = totalCharacters;
        modalErrors.textContent = errorCount;

        resultsModal.style.display = 'flex';

        saveResult(wpm, accuracy, timeElapsed);
    }

    function highlightCurrentWord() {
        const typedText = typingArea.value;
        let typedWords = typedText.split(' ');
        currentWordIndex = Math.max(0, typedWords.length - 1);

        let html = '';
        words.forEach((word, index) => {
            if (index === currentWordIndex && typedText.length < sampleText.textContent.length) {
                html += `<span class="current-word">${word}</span> `;
            } else {
                if (index < typedWords.length) {
                    const isCorrect = word === typedWords[index];
                    html += `<span class="${isCorrect ? 'correct' : 'incorrect'}">${word}</span> `;
                } else {
                    html += word + ' ';
                }
            }
        });

        sampleText.innerHTML = html.trim();
    }

    function loadTextBasedOnDifficulty() {
        let text = '';
        switch (currentDifficulty) {
            case 'easy':
                text = "The quick brown fox jumps over the lazy dog. Practice daily to improve typing speed.";
                break;
            case 'medium':
                text = "Typing faster comes with time. Focus on accuracy and then build speed. Avoid looking at the keyboard.";
                break;
            case 'hard':
                text = "function calcWPM(chars, time) { const gross = (chars / 5) / time; return Math.round(gross); }";
                break;
        }

        originalText = text;
        sampleText.textContent = text;
        words = text.split(' ');
    }

    function saveResult(wpm, accuracy, time) {
        const results = JSON.parse(localStorage.getItem('typingResults') || '[]');
        results.push({
            wpm,
            accuracy,
            time,
            date: new Date().toISOString(),
            difficulty: currentDifficulty,
            backspaceDisabled
        });

        if (results.length > 50) {
            results.splice(0, results.length - 50);
        }

        localStorage.setItem('typingResults', JSON.stringify(results));
    }

    function shareResults() {
        const wpm = modalWpm.textContent;
        const accuracy = modalAccuracy.textContent;
        const backspaceStatus = backspaceDisabled ? ' (No Backspace)' : '';

        const shareText = `🚀 I just achieved ${wpm} WPM with ${accuracy} accuracy on SpeedType Pro${backspaceStatus}! Try it yourself at ${location.href}`;

        if (navigator.share) {
            navigator.share({
                title: 'My SpeedType Pro Results',
                text: shareText,
                url: location.href
            }).catch(err => {
                console.log('Error sharing:', err);
                copyToClipboard(shareText);
            });
        } else {
            copyToClipboard(shareText);
        }
    }

    function copyToClipboard(text) {
        navigator.clipboard.writeText(text).then(() => {
            const originalText = modalShare.innerHTML;
            modalShare.innerHTML = '<i class="fas fa-check"></i> Copied!';
            modalShare.style.backgroundColor = '#28a745';

            setTimeout(() => {
                modalShare.innerHTML = originalText;
                modalShare.style.backgroundColor = '';
            }, 2000);
        }).catch(err => {
            console.log('Could not copy text: ', err);
            alert('Results copied to clipboard!');
        });
    }

    function toggleDarkMode() {
        document.body.classList.toggle('dark-mode');
        const icon = darkModeToggle.querySelector('i');

        if (document.body.classList.contains('dark-mode')) {
            icon.classList.remove('fa-moon');
            icon.classList.add('fa-sun');
            localStorage.setItem('darkMode', 'enabled');
        } else {
            icon.classList.remove('fa-sun');
            icon.classList.add('fa-moon');
            localStorage.setItem('darkMode', 'disabled');
        }
    }

    if (localStorage.getItem('darkMode') === 'enabled') {
        document.body.classList.add('dark-mode');
        const icon = darkModeToggle.querySelector('i');
        icon.classList.remove('fa-moon');
        icon.classList.add('fa-sun');
    }

    // Initialize time button active state
    time60Btn.classList.add('active');

   document.addEventListener('keydown', function(e) {
        if ((e.ctrlKey || e.metaKey) && e.key === 'r') {
            e.preventDefault();
            resetTest();
        }

        if (e.key === 'Escape' && resultsModal.style.display === 'flex') {
            resultsModal.style.display = 'none';
        }
    });

    typingArea.addEventListener('blur', function() {
        if (isTyping) {
            setTimeout(() => typingArea.focus(), 100);
        }
    });
});
