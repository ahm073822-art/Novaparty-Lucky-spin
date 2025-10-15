document.addEventListener('DOMContentLoaded', (event) => {
    if (window.Telegram && window.Telegram.WebApp) {
        window.Telegram.WebApp.ready();
        
        if (window.Telegram.WebApp.MainButton) {
            window.Telegram.WebApp.MainButton.hide();
            console.log("✅ Telegram MainButton disembunyikan untuk mencegah penutupan instan.");
        }
    }
    
    const A17 = document.querySelector('.A17');
    const A4 = document.querySelector('.A4');
    const A5 = document.querySelector('.A5');
    const A12 = document.querySelector('.A12');
    const A15 = document.querySelector('.A15');
    const A18 = document.querySelector('.A18');
    const textContainer = document.getElementById('teks-wrapper');

    if (A15) { A15.style.visibility = 'hidden'; }
    if (A18) { A18.style.visibility = 'hidden'; }
    
    const highPriorityStops = [405, 495, 450, 586, 676];
    const lowPriorityStops = [360, 631, 540];
    let selectedAngle = null;

    const resultMap = {
        '405': '1000', '495': '4000', '450': '5000',
        '586': '2000', '676': '3000', '360': '8000',
        '631': '6000', '540': '7000'
    };

    let spriteMap = {};
    const files = ['1'];

    function displayNewSpriteText(container, map, textToDisplay) {
        container.innerHTML = '';

        for (const char of textToDisplay) {
            const charData = map[char];

            if (charData) {
                const charElement = document.createElement('span');
                charElement.classList.add('sprite-char');

                charElement.style.backgroundImage = `url(${charData.image})`;
                charElement.style.backgroundPosition = charData.position;
                charElement.style.width = charData.width;
                charElement.style.height = charData.height;
                charElement.style.marginRight = charData.advance;
                charElement.style.display = 'inline-block';

                container.appendChild(charElement);
            } else if (char === ' ') {
                const spaceElement = document.createElement('span');
                spaceElement.classList.add('sprite-space');

                const spaceData = map[String.fromCharCode(32)];
                spaceElement.style.width = spaceData ? spaceData.advance : '20px';

                spaceElement.style.display = 'inline-block';
                container.appendChild(spaceElement);
            } else {
                const missingChar = document.createElement('span');
                missingChar.textContent = char;
                missingChar.style.fontSize = '32px';
                missingChar.style.color = 'red';
                container.appendChild(missingChar);
            }
        }
    }

    if (A17 && A4 && A5) {
        A17.addEventListener('click', () => {
            
            if (textContainer) {
                textContainer.style.visibility = 'hidden';
                textContainer.classList.remove('blinking-neon-animation');
            }
            if (A15) { A15.style.visibility = 'hidden';}
            if (A18) { A18.style.visibility = 'hidden';}

            if (A12) {
                A12.classList.remove('hidden', 'neon-effect');
            }
            A4.style.transition = 'none';
            A5.style.transition = 'none';
            A4.style.transform = 'rotate(0deg)';
            A5.style.transform = 'rotate(0deg)';

            setTimeout(() => {
                const stops = Math.random() < 0.8 ? highPriorityStops : lowPriorityStops;
                selectedAngle = stops[Math.floor(Math.random() * stops.length)];

                const totalSpins = (5 * 360) + selectedAngle;
                const transitionDuration = 3;

                A4.style.transition = `transform ${transitionDuration}s ease-out`;
                A5.style.transition = `transform ${transitionDuration}s linear`;
                A4.style.transform = `rotate(${totalSpins}deg)`;
                A5.style.transform = `rotate(${totalSpins}deg)`;

                const delayTime = (transitionDuration * 1000) + 50;

                setTimeout(function handleSpinResult() {
                    if (A12) {A12.classList.add('neon-effect');}
                    if (A15) {A15.style.visibility = 'visible';}
                    if (A18) {A18.style.visibility = 'visible';}

                    if (selectedAngle !== null && textContainer) {
                        const resultText = resultMap[selectedAngle.toString()];

                        if (resultText) {
                            displayNewSpriteText(textContainer, spriteMap, resultText);
                            
                            textContainer.style.visibility = 'visible';
                            textContainer.classList.add('blinking-neon-animation');

                            if (window.Telegram && window.Telegram.WebApp) {
                                const dataUntukBot = JSON.stringify({
                                    hasil_spin: resultText,
                                    sudut: selectedAngle
                                });
                                
                                console.log("DATA DIKIRIM KE BOT:", dataUntukBot);
                                window.Telegram.WebApp.sendData(dataUntukBot);

                                const WAKTU_JEDA = 10000; 
                                console.log(`⏳ JEDA DIMULAI. App akan menutup dalam ${WAKTU_JEDA / 1000} detik.`);

                                setTimeout(() => {
                                    console.log("✅ Waktu jeda selesai. Memanggil close().");
                                    window.Telegram.WebApp.close();
                                }, WAKTU_JEDA); 
                            } else {
                                console.error("❌ GAGAL! Telegram WebApp API tidak ditemukan.");
                            }

                        } else {
                            textContainer.textContent = `ERROR: No result for ${selectedAngle}`;
                        }
                    }
                }, delayTime);

            }, 10);
        });
    }

    Promise.all(
        files.map(file =>
            fetch(`vollkorn_96_${file}.xml`)
            .then(response => {
                if (!response.ok) {
                    throw new Error(`Gagal memuat XML: vollkorn_96_${file}.xml. Status: ${response.status}`);
                }
                return response.text();
            })
            .then(str => (new window.DOMParser()).parseFromString(str, "text/xml"))
            .then(data => {
                const symbols = data.querySelectorAll('char');

                symbols.forEach(symbol => {
                    const charCode = symbol.getAttribute('id');
                    let char;
                    if (charCode === '32') {
                        char = ' ';
                    } else if (charCode === '44') {
                        char = ',';
                    } else {
                        char = String.fromCharCode(parseInt(charCode, 10));
                    }

                    const x = symbol.getAttribute('x');
                    const y = symbol.getAttribute('y');
                    const width = symbol.getAttribute('width');
                    const height = symbol.getAttribute('height');
                    const xadvance = symbol.getAttribute('xadvance') || width;

                    const imageName = `vollkorn_96_${file}.png`;

                    if (char && char.trim() !== '') {
                        spriteMap[char] = {
                            position: `-${x}px -${y}px`,
                            width: `${width}px`,
                            height: `${height}px`,
                            advance: `${xadvance}px`,
                            image: imageName
                        };
                    }
                });
            })
        )
    )
    .then(() => {
        if (textContainer) {
            displayNewSpriteText(textContainer, spriteMap, 'HALLO'); 
            textContainer.style.visibility = 'visible';
            textContainer.classList.add('blinking-neon-animation');
        }
    })
    .catch(error => {
        if (textContainer) {
            textContainer.textContent = `Error Font: ${error.message}`;
            textContainer.style.fontSize = '16px';
            textContainer.style.visibility = 'visible';
        }
    });
});



Bantu revisi
