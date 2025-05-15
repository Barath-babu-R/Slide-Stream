
        // Main variables
        let currentSlideIndex = 0;
        let slides = [];
        let presentationTitle = "";
        
        // DOM Elements
        const welcomeScreen = document.getElementById('welcome-screen');
        const presentationContainer = document.getElementById('presentation-container');
        const fileInput = document.getElementById('file-input');
        const uploadArea = document.getElementById('upload-area');
        const headerUploadBtn = document.getElementById('header-upload-btn');
        const fileInfo = document.getElementById('file-info');
        const thumbnailsPanel = document.getElementById('thumbnails-panel');
        const slideView = document.getElementById('slide-view');
        const slideCounter = document.getElementById('slide-counter');
        const progressFill = document.getElementById('progress-fill');
        const prevSlideBtn = document.getElementById('prev-slide');
        const nextSlideBtn = document.getElementById('next-slide');
        const loadingIndicator = document.getElementById('loading');
        
        // Event Listeners
        uploadArea.addEventListener('click', () => fileInput.click());
        headerUploadBtn.addEventListener('click', () => fileInput.click());
        fileInput.addEventListener('change', handleFileUpload);
        prevSlideBtn.addEventListener('click', showPreviousSlide);
        nextSlideBtn.addEventListener('click', showNextSlide);
        
        // Set up drag and drop
        uploadArea.addEventListener('dragover', (e) => {
            e.preventDefault();
            uploadArea.style.borderColor = 'var(--primary-color)';
            uploadArea.style.backgroundColor = '#f1f7ff';
        });
        
        uploadArea.addEventListener('dragleave', (e) => {
            e.preventDefault();
            uploadArea.style.borderColor = '#ced4da';
            uploadArea.style.backgroundColor = 'white';
        });
        
        uploadArea.addEventListener('drop', (e) => {
            e.preventDefault();
            uploadArea.style.borderColor = '#ced4da';
            uploadArea.style.backgroundColor = 'white';
            
            if (e.dataTransfer.files.length) {
                fileInput.files = e.dataTransfer.files;
                handleFileUpload();
            }
        });
        
    // Array of catchy loading phrases
    const loadingPhrases = [
        "Polishing your slides to perfection...",
        "Adding a touch of magic to your presentation...",
        "Your ideas are about to shine...",
        "Crafting a masterpiece from your content...",
        "Transforming data into visual stories...",
        "Preparing to impress your audience...",
        "Making your information look stunning...",
        "Good things come to those who wait...",
        "Assembling your knowledge in style...",
        "Just a moment while we work our magic..."
    ];

        // Function to show loading indicator with random phrase
        function showLoading() {
            loadingIndicator.style.display = 'flex';
            const randomPhrase = loadingPhrases[Math.floor(Math.random() * loadingPhrases.length)];
            document.getElementById('loading-subtext').textContent = randomPhrase;
            
            // Change phrase every few seconds if loading takes longer
            const phraseInterval = setInterval(() => {
                const newRandomPhrase = loadingPhrases[Math.floor(Math.random() * loadingPhrases.length)];
                document.getElementById('loading-subtext').textContent = newRandomPhrase;
            }, 4000);
            
            return phraseInterval; // Return interval ID so we can clear it later
        }

        // Function to hide loading indicator
        function hideLoading(intervalId) {
            loadingIndicator.style.display = 'none';
            clearInterval(intervalId);
        }

        // In your handleFileUpload function:
        function handleFileUpload() {
            if (fileInput.files.length === 0) return;
            
            const file = fileInput.files[0];
            
            // Check if it's a JSON file
            if (!file.name.toLowerCase().endsWith('.json')) {
                alert('Please upload a JSON file.');
                return;
            }
            
            // Show loading indicator with phrases
            const phraseInterval = showLoading();
            
            // Wait for 3 seconds before processing
            setTimeout(() => {
                // Read the file after the initial delay
                const reader = new FileReader();
                reader.onload = function(e) {
                    try {
                        const jsonData = JSON.parse(e.target.result);
                        
                        // Process the data (this might take some time for large files)
                        processJsonData(jsonData);
                        
                        // Update file info
                        fileInfo.textContent = file.name;
                        
                        // Switch to presentation view
                        welcomeScreen.style.display = 'none';
                        presentationContainer.style.display = 'flex';
                        
                        // Ensure first slide is displayed prominently
                        const firstSlide = document.getElementById('slide-0');
                        if (firstSlide) {
                            firstSlide.classList.remove('slide-hidden');
                            firstSlide.classList.add('slide-current');
                            firstSlide.style.opacity = '1';
                        }
                        
                        // Hide loading indicator
                        hideLoading(phraseInterval);
                        
                    } catch (error) {
                        hideLoading(phraseInterval);
                        alert('Invalid JSON file. Please check the format and try again.');
                        console.error('Error parsing JSON:', error);
                    }
                };
                
                reader.onerror = function() {
                    hideLoading(phraseInterval);
                    alert('Error reading the file. Please try again.');
                };
                
                reader.readAsText(file);
            }, 3000); // 3 second delay before processing
        }
        
        // Function to process JSON data
        function processJsonData(data) {
            // Reset everything
            currentSlideIndex = 0;
            slides = [];
            thumbnailsPanel.innerHTML = '<div class="thumbnails-header">SLIDES</div>';
            slideView.innerHTML = '';
            
            // Extract presentation data
            presentationTitle = data.title || "Untitled Presentation";
            document.title = presentationTitle + " - SlideCast";
            
            if (Array.isArray(data.slides) && data.slides.length > 0) {
                slides = data.slides;
                
                // Immediately update the slide counter
                updateSlideCounter();
                
                // Create thumbnails and slides
                createThumbnails();
                createSlides();
                
                // Show the first slide
                showSlide(0);
                updateProgress();
                
                // Enable/disable navigation buttons
                updateNavigationButtons();
            } else {
                alert('No slides found in the JSON file. Please check the format and try again.');
            }
        }
        
        // Function to create thumbnails
        function createThumbnails() {
            slides.forEach((slide, index) => {
                const thumbnailItem = document.createElement('div');
                thumbnailItem.className = 'thumbnail-item';
                thumbnailItem.dataset.index = index;
                // In createThumbnails function:
                thumbnailItem.addEventListener('click', (e) => {
                    e.preventDefault();
                    showSlide(index); // Pass the numeric index directly
                });
                
                const thumbnailPreview = document.createElement('div');
                thumbnailPreview.className = 'thumbnail-preview';
                
                // Create simple visualization of slide content
                if (slide.imageUrl) {
                    const img = document.createElement('img');
                    img.src = slide.imageUrl;
                    img.alt = slide.title || `Slide ${index + 1}`;
                    thumbnailPreview.appendChild(img);
                } else {
                    // Create a simple representation of text content
                    thumbnailPreview.style.backgroundColor = '#f8f9fa';
                    thumbnailPreview.style.display = 'flex';
                    thumbnailPreview.style.flexDirection = 'column';
                    thumbnailPreview.style.padding = '10px';
                    
                    const miniTitle = document.createElement('div');
                    miniTitle.style.height = '10px';
                    miniTitle.style.width = '80%';
                    miniTitle.style.backgroundColor = '#ced4da';
                    miniTitle.style.marginBottom = '8px';
                    miniTitle.style.borderRadius = '2px';
                    
                    const miniContent1 = document.createElement('div');
                    miniContent1.style.height = '6px';
                    miniContent1.style.width = '100%';
                    miniContent1.style.backgroundColor = '#e9ecef';
                    miniContent1.style.marginBottom = '4px';
                    miniContent1.style.borderRadius = '2px';
                    
                    const miniContent2 = document.createElement('div');
                    miniContent2.style.height = '6px';
                    miniContent2.style.width = '90%';
                    miniContent2.style.backgroundColor = '#e9ecef';
                    miniContent2.style.marginBottom = '4px';
                    miniContent2.style.borderRadius = '2px';
                    
                    const miniContent3 = document.createElement('div');
                    miniContent3.style.height = '6px';
                    miniContent3.style.width = '70%';
                    miniContent3.style.backgroundColor = '#e9ecef';
                    miniContent3.style.borderRadius = '2px';
                    
                    thumbnailPreview.appendChild(miniTitle);
                    thumbnailPreview.appendChild(miniContent1);
                    thumbnailPreview.appendChild(miniContent2);
                    thumbnailPreview.appendChild(miniContent3);
                }
                
                const thumbnailNumber = document.createElement('div');
                thumbnailNumber.className = 'thumbnail-number';
                thumbnailNumber.textContent = index + 1;
                thumbnailPreview.appendChild(thumbnailNumber);
                
                const thumbnailTitle = document.createElement('div');
                thumbnailTitle.className = 'thumbnail-title';
                thumbnailTitle.textContent = slide.title || `Slide ${index + 1}`;
                
                thumbnailItem.appendChild(thumbnailPreview);
                thumbnailItem.appendChild(thumbnailTitle);
                thumbnailsPanel.appendChild(thumbnailItem);
            });
        }
        
        // Function to create slides
function createSlides() {
    // Professional color schemes with good contrast
    const templates = [
        {
            name: 'corporate-blue',
            headerBg: 'linear-gradient(135deg, #1a3a8f, #2a52be)',
            textColor: '#ffffff',
            bulletColor: '#1a3a8f' // Added explicit bullet color
        },
        {
            name: 'dark-theme',
            headerBg: 'linear-gradient(135deg, #2c3e50, #34495e)',
            textColor: '#ffffff',
            bulletColor: '#2c3e50'
        },
        {
            name: 'professional-green',
            headerBg: 'linear-gradient(135deg, #00695c, #00897b)',
            textColor: '#ffffff',
            bulletColor: '#00695c'
        },
        {
            name: 'luxury-gold',
            headerBg: 'linear-gradient(135deg, #5d4037, #8d6e63)',
            textColor: '#ffffff',
            bulletColor: '#5d4037'
        },
        {
            name: 'modern-purple',
            headerBg: 'linear-gradient(135deg, #4527a0, #5e35b1)',
            textColor: '#ffffff',
            bulletColor: '#4527a0'
        },
        {
            name: 'executive-gray',
            headerBg: 'linear-gradient(135deg, #455a64, #607d8b)',
            textColor: '#ffffff',
            bulletColor: '#455a64'
        },
        {
            name: 'contrast-orange',
            headerBg: 'linear-gradient(135deg, #e65100, #f57c00)',
            textColor: '#ffffff',
            bulletColor: '#e65100'
        },
        {
            name: 'deep-red',
            headerBg: 'linear-gradient(135deg, #b71c1c, #d32f2f)',
            textColor: '#ffffff',
            bulletColor: '#b71c1c'
        }
    ];

    // Animation presets
    const animationPresets = [
        'fadeIn', 
        'slideInRight', 
        'slideInLeft', 
        'zoomIn', 
        'bounceIn'
    ];

    slides.forEach((slide, index) => {
        const template = templates[index % templates.length];
        const animationType = animationPresets[index % animationPresets.length];
        
        // Create slide element
        const slideElement = document.createElement('div');
        slideElement.className = `slide slide-hidden`;
        slideElement.id = `slide-${index}`;
        slideElement.dataset.animation = animationType;
        slideElement.dataset.templateName = template.name;
        
        // Create slide header with professional styling
        const slideHeader = document.createElement('div');
        slideHeader.className = 'slide-header';
        slideHeader.style.background = template.headerBg;
        slideHeader.style.color = template.textColor;
        
        // Add decorative elements with subtle animation
        const headerDecoration = document.createElement('div');
        headerDecoration.className = 'header-decoration';
        headerDecoration.style.opacity = '0.15';
        headerDecoration.style.background = 'radial-gradient(circle, currentColor 1px, transparent 1px)';
        headerDecoration.style.backgroundSize = '10px 10px';
        headerDecoration.style.position = 'absolute';
        headerDecoration.style.top = '0';
        headerDecoration.style.left = '0';
        headerDecoration.style.right = '0';
        headerDecoration.style.bottom = '0';
        headerDecoration.style.pointerEvents = 'none';
        slideHeader.appendChild(headerDecoration);
        
        // Add title with professional typography
        const slideTitle = document.createElement('h2');
        slideTitle.className = 'slide-title animate-title';
        slideTitle.textContent = slide.title || `Slide ${index + 1}`;
        slideTitle.style.animationDelay = '0.1s';
        slideTitle.style.fontWeight = '600';
        slideTitle.style.letterSpacing = '0.5px';
        slideTitle.style.textShadow = '0 2px 4px rgba(0,0,0,0.2)';
        slideHeader.appendChild(slideTitle);
        
        // Add subtitle with slightly lighter color for hierarchy
        if (slide.subtitle) {
            const slideSubtitle = document.createElement('div');
            slideSubtitle.className = 'slide-subtitle animate-subtitle';
            slideSubtitle.textContent = slide.subtitle;
            slideSubtitle.style.animationDelay = '0.2s';
            slideSubtitle.style.opacity = '0.9';
            slideSubtitle.style.fontWeight = '400';
            slideSubtitle.style.fontSize = '1.2rem';
            slideSubtitle.style.marginTop = '0.5rem';
            slideHeader.appendChild(slideSubtitle);
        }
        
        // Create slide content container with professional spacing
        const slideContent = document.createElement('div');
        slideContent.className = 'slide-content';
        
        // Set content font for better readability
        slideContent.style.fontFamily = "'Segoe UI', Roboto, 'Helvetica Neue', sans-serif";
        slideContent.style.fontSize = '1.1rem';
        slideContent.style.lineHeight = '1.7';
        
        // Add content with professional formatting
        if (slide.content) {
            if (Array.isArray(slide.content)) {
                slide.content.forEach((paragraph, i) => {
                    const p = document.createElement('p');
                    p.className = 'animate-content';
                    p.textContent = paragraph;
                    p.style.animationDelay = `${0.3 + i * 0.1}s`;
                    p.style.marginBottom = '1rem';
                    p.style.color = '#333';
                    slideContent.appendChild(p);
                });
            } else {
                const p = document.createElement('p');
                p.className = 'animate-content';
                p.textContent = slide.content;
                p.style.animationDelay = '0.3s';
                p.style.marginBottom = '1.5rem';
                p.style.color = '#333';
                slideContent.appendChild(p);
            }
        }
        
        // Add bullet points with professional styling
        if (slide.bulletPoints?.length) {
            const list = document.createElement('ul');
            list.className = 'animate-list';
            list.style.margin = '1.5rem 0';
            list.style.paddingLeft = '2rem';
            
            // Add a custom CSS style for bullet points that matches the template
            const bulletStyle = document.createElement('style');
            bulletStyle.textContent = `
                #slide-${index} .bullet-styled {
                    position: relative;
                }
                #slide-${index} .bullet-styled::before {
                    content: '';
                    position: absolute;
                    left: -1.5rem;
                    top: 0.5rem;
                    width: 8px;
                    height: 8px;
                    background-color: ${template.bulletColor};
                    border-radius: 50%;
                }
            `;
            slideElement.appendChild(bulletStyle);
            
            slide.bulletPoints.forEach((point, i) => {
                const li = document.createElement('li');
                li.className = 'animate-list-item bullet-styled';
                li.textContent = point;
                li.style.animationDelay = `${0.4 + i * 0.1}s`;
                li.style.marginBottom = '0.8rem';
                li.style.position = 'relative';
                li.style.paddingLeft = '0.5rem';
                li.style.color = '#444';
                li.style.listStyleType = 'none'; // Remove default bullets
                
                list.appendChild(li);
            });
            
            slideContent.appendChild(list);
        }
        
        // Add image with professional framing
        if (slide.imageUrl) {
            const imgContainer = document.createElement('div');
            imgContainer.className = 'image-container animate-image';
            imgContainer.style.margin = '2rem auto';
            imgContainer.style.maxWidth = '80%';
            imgContainer.style.textAlign = 'center';
            
            const img = document.createElement('img');
            img.src = slide.imageUrl;
            img.alt = slide.imageAlt || slide.title || `Slide ${index + 1}`;
            img.className = 'slide-image';
            img.onerror = function() {
                this.src = 'placeholder-image.jpg'; // Fallback image
                this.alt = 'Image not available';
            };
            img.style.borderRadius = '4px';
            img.style.boxShadow = '0 4px 12px rgba(0,0,0,0.15)';
            img.style.maxHeight = '300px';
            img.style.width = 'auto';
            img.style.height = 'auto';
            img.style.maxWidth = '100%';
            
            imgContainer.appendChild(img);
            slideContent.appendChild(imgContainer);
        }
        
        // Add footer if needed
        if (slide.footer) {
            const slideFooter = document.createElement('div');
            slideFooter.className = 'slide-footer animate-footer';
            slideFooter.textContent = slide.footer;
            slideFooter.style.animationDelay = '0.5s';
            slideFooter.style.fontSize = '0.9rem';
            slideFooter.style.color = '#666';
            slideFooter.style.textAlign = 'center';
            slideFooter.style.marginTop = 'auto';
            slideFooter.style.paddingTop = '1rem';
            slideFooter.style.borderTop = '1px solid #eee';
            slideElement.appendChild(slideFooter);
        }
        
        // Assemble the slide
        slideElement.appendChild(slideHeader);
        slideElement.appendChild(slideContent);
        
        // Add to DOM
        slideView.appendChild(slideElement);
    });
}

function showSlide(index) {
    index = parseInt(index);
    if (index === currentSlideIndex || index < 0 || index >= slides.length) return;
    
    const direction = index > currentSlideIndex ? 'right' : 'left';
    const currentSlide = document.getElementById(`slide-${currentSlideIndex}`);
    const nextSlide = document.getElementById(`slide-${index}`);
    
    if (!nextSlide) return;
    
    // Prepare animation classes
    const exitAnimation = direction === 'right' ? 'exit-to-left' : 'exit-to-right';
    const enterAnimation = direction === 'right' ? 'enter-from-right' : 'enter-from-left';
    
    // Hide current slide with exit animation
    if (currentSlide) {
        currentSlide.classList.add(exitAnimation);
        currentSlide.addEventListener('animationend', () => {
            currentSlide.classList.remove('slide-current', exitAnimation);
            currentSlide.classList.add('slide-hidden');
        }, { once: true });
    }
    
    // Show new slide with enter animation
    nextSlide.classList.remove('slide-hidden');
    nextSlide.classList.add('slide-current', enterAnimation);
    
    // Clean up animation classes after transition
    nextSlide.addEventListener('animationend', () => {
        nextSlide.classList.remove(enterAnimation);
    }, { once: true });
    
    // Update current index
    currentSlideIndex = index;
    
    // Update UI elements
    updateSlideCounter();
    updateProgress();
    updateNavigationButtons();
    
    // Update active thumbnail
    updateActiveThumbnail();
    
    // Trigger content animations
    animateSlideContent(nextSlide);
}


        function animateSlideContent(slide) {
            // Reset all animations first
            const animatables = slide.querySelectorAll('[class*="animate-"]');
            animatables.forEach(el => {
                el.style.animation = 'none';
                void el.offsetWidth; // Trigger reflow
                el.style.animation = '';
            });
        }

        function updateActiveThumbnail() {
            const thumbnails = document.querySelectorAll('.thumbnail-item');
            thumbnails.forEach(thumb => {
                thumb.classList.remove('active');
                
                if (parseInt(thumb.dataset.index) === currentSlideIndex) {
                    thumb.classList.add('active');
                    
                    // Smooth scroll to thumbnail if not fully visible
                    const panel = thumb.parentElement;
                    const panelRect = panel.getBoundingClientRect();
                    const thumbRect = thumb.getBoundingClientRect();
                    
                    // Calculate positions
                    const isVisible = (
                        thumbRect.top >= panelRect.top &&
                        thumbRect.bottom <= panelRect.bottom
                    );
                    
                    if (!isVisible) {
                        // Scroll with offset to account for header
                        const panelTop = panel.scrollTop;
                        const thumbTop = thumb.offsetTop;
                        const thumbHeight = thumb.offsetHeight;
                        const panelHeight = panel.offsetHeight;
                        
                        panel.scrollTo({
                            top: thumbTop - (panelHeight / 2) + (thumbHeight / 2),
                            behavior: 'smooth'
                        });
                    }
                }
            });
        }

        
        // Function to show the previous slide
        function showPreviousSlide() {
            if (currentSlideIndex > 0) {
                showSlide(currentSlideIndex - 1);
            }
        }
        
        // Function to show the next slide
        function showNextSlide() {
            if (currentSlideIndex < slides.length - 1) {
                showSlide(currentSlideIndex + 1);
            }
        }
        
        // Function to update the slide counter
        function updateSlideCounter() {
            slideCounter.textContent = `Slide ${currentSlideIndex + 1} of ${slides.length}`;
        }
        
        // Function to update the progress bar
        function updateProgress() {
            const progress = ((currentSlideIndex + 1) / slides.length) * 100;
            progressFill.style.width = `${progress}%`;
        }
        
        // Function to update navigation buttons
        function updateNavigationButtons() {
            prevSlideBtn.disabled = currentSlideIndex === 0;
            nextSlideBtn.disabled = currentSlideIndex === slides.length - 1;
        }
        
        // Add keyboard navigation
        document.addEventListener('keydown', (e) => {
            if (presentationContainer.style.display === 'flex') {
                if (e.key === 'ArrowLeft' || e.key === 'PageUp') {
                    showPreviousSlide();
                } else if (e.key === 'ArrowRight' || e.key === 'PageDown' || e.key === ' ') {
                    showNextSlide();
                }
            }
        });
        
        // Handle window resize to maintain slide aspect ratio
        window.addEventListener('resize', () => {
            if (presentationContainer.style.display === 'flex') {
                const slides = document.querySelectorAll('.slide');
                slides.forEach(slide => {
                    // Set max dimensions while maintaining aspect ratio
                    const slideView = document.getElementById('slide-view');
                    const viewWidth = slideView.clientWidth - 40; // Subtract padding
                    const viewHeight = slideView.clientHeight - 40;
                    
                    const slideRatio = 16 / 9; // Standard presentation ratio
                    
                    let slideWidth = viewWidth;
                    let slideHeight = slideWidth / slideRatio;
                    
                    if (slideHeight > viewHeight) {
                        slideHeight = viewHeight;
                        slideWidth = slideHeight * slideRatio;
                    }
                    
                    slide.style.width = `${slideWidth}px`;
                    slide.style.height = `${slideHeight}px`;
                });
            }
        });
