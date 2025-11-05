(function() {
  'use strict';

  // Error types and messages
  const ErrorType = {
    CAMERA_DENIED: 'camera_denied',
    CAMERA_UNAVAILABLE: 'camera_unavailable',
    FILE_TOO_LARGE: 'file_too_large',
    INVALID_FILE_TYPE: 'invalid_file_type',
    NETWORK_ERROR: 'network_error',
    USAGE_LIMIT: 'usage_limit',
    PROCESSING_ERROR: 'processing_error',
    UNKNOWN: 'unknown'
  };

  const ErrorMessages = {
    [ErrorType.CAMERA_DENIED]: {
      title: 'Camera Access Denied',
      message: 'Please allow camera access in your browser settings, or use the upload option instead.',
      canRetry: false
    },
    [ErrorType.CAMERA_UNAVAILABLE]: {
      title: 'Camera Not Available',
      message: 'No camera was detected on your device. Please use the upload option instead.',
      canRetry: false
    },
    [ErrorType.FILE_TOO_LARGE]: {
      title: 'File Too Large',
      message: 'Please choose an image smaller than 10MB.',
      canRetry: true
    },
    [ErrorType.INVALID_FILE_TYPE]: {
      title: 'Invalid File Type',
      message: 'Please upload a JPG, PNG, or GIF image.',
      canRetry: true
    },
    [ErrorType.NETWORK_ERROR]: {
      title: 'Connection Problem',
      message: 'Please check your internet connection and try again.',
      canRetry: true
    },
    [ErrorType.USAGE_LIMIT]: {
      title: 'Usage Limit Reached',
      message: 'You\'ve reached your try-on limit. Please contact the store for more information.',
      canRetry: false
    },
    [ErrorType.PROCESSING_ERROR]: {
      title: 'Processing Failed',
      message: 'We couldn\'t process your image. Please try a different photo.',
      canRetry: true
    },
    [ErrorType.UNKNOWN]: {
      title: 'Something Went Wrong',
      message: 'An unexpected error occurred. Please try again later.',
      canRetry: true
    }
  };

  // Main VirtualTryOn class
  class VirtualTryOn {
    constructor() {
      this.modal = document.getElementById('virtual-tryon-modal');
      this.button = document.getElementById('virtual-tryon-button');
      this.stream = null;
      this.currentImageData = null;
      this.productData = null;

      if (this.button) {
        this.init();
      }
    }

    init() {
      // Get product data from button
      const imageData = this.button.dataset.productImage;
      console.log('Product image data attribute:', imageData);

      this.productData = {
        id: this.button.dataset.productId,
        variantId: this.button.dataset.variantId,
        title: this.button.dataset.productTitle,
        image: imageData || ''
      };

      console.log('Parsed product data:', this.productData);

      // Set up event listeners
      this.setupEventListeners();
    }

    setupEventListeners() {
      // Open modal
      this.button.addEventListener('click', () => this.openModal());

      // Close modal
      const closeBtn = this.modal.querySelector('.modal-close');
      if (closeBtn) {
        closeBtn.addEventListener('click', () => this.closeModal());
      }

      // Camera button
      const cameraBtn = document.getElementById('camera-button');
      if (cameraBtn) {
        cameraBtn.addEventListener('click', () => this.startCamera());
      }

      // File upload
      const fileInput = document.getElementById('file-input');
      const fileLabel = fileInput?.parentElement;
      if (fileInput) {
        fileInput.addEventListener('change', (e) => this.handleFileSelect(e));
      }
      if (fileLabel) {
        fileLabel.addEventListener('keydown', (e) => {
          if (e.key === 'Enter' || e.key === ' ') {
            e.preventDefault();
            fileInput.click();
          }
        });
      }

      // Capture button
      const captureBtn = document.getElementById('capture-button');
      if (captureBtn) {
        captureBtn.addEventListener('click', () => this.capturePhoto());
      }

      // Cancel camera
      const cancelCamera = document.getElementById('cancel-camera');
      if (cancelCamera) {
        cancelCamera.addEventListener('click', () => {
          this.stopCamera();
          this.showState('options');
        });
      }

      // Process button
      const processBtn = document.getElementById('process-button');
      if (processBtn) {
        processBtn.addEventListener('click', () => this.processTryOn());
      }

      // Retake button
      const retakeBtn = document.getElementById('retake-button');
      if (retakeBtn) {
        retakeBtn.addEventListener('click', () => this.retakePhoto());
      }

      // Try again button
      const tryAgainBtn = document.getElementById('try-again');
      if (tryAgainBtn) {
        tryAgainBtn.addEventListener('click', () => this.retakePhoto());
      }

      // Add to cart buttons
      const addToCartBtn = document.getElementById('add-to-cart');
      if (addToCartBtn) {
        addToCartBtn.addEventListener('click', () => this.addToCart());
      }

      const addToCartProcessingBtn = document.getElementById('add-to-cart-processing');
      if (addToCartProcessingBtn) {
        addToCartProcessingBtn.addEventListener('click', () => this.addToCart());
      }

      // Cancel processing button
      const cancelProcessingBtn = document.getElementById('cancel-processing');
      if (cancelProcessingBtn) {
        cancelProcessingBtn.addEventListener('click', () => this.cancelProcessing());
      }

      // Error buttons
      const errorRetry = document.getElementById('error-retry');
      const errorCancel = document.getElementById('error-cancel');
      if (errorRetry) {
        errorRetry.addEventListener('click', () => this.showState('options'));
      }
      if (errorCancel) {
        errorCancel.addEventListener('click', () => this.closeModal());
      }
    }

    openModal() {
      this.modal.showModal();
      this.showState('options');
      this.currentImageData = null;

      // Prevent auto-focus on close button
      const closeBtn = this.modal.querySelector('.modal-close');
      if (closeBtn) {
        closeBtn.blur();
      }
    }

    closeModal() {
      this.modal.close();
      this.stopCamera();
      this.button.focus();
    }

    showState(state) {
      // Hide all views
      const views = this.modal.querySelectorAll('[data-state]');
      views.forEach(view => {
        view.hidden = view.dataset.state !== state;
      });
    }

    async startCamera() {
      try {
        this.showState('camera');

        this.stream = await navigator.mediaDevices.getUserMedia({
          video: {
            facingMode: 'user',
            width: { ideal: 1024 },
            height: { ideal: 1024 }
          }
        });

        const video = document.getElementById('camera-video');
        video.srcObject = this.stream;
      } catch (err) {
        console.error('Camera access error:', err);

        let errorType = ErrorType.CAMERA_UNAVAILABLE;
        if (err.name === 'NotAllowedError' || err.name === 'PermissionDeniedError') {
          errorType = ErrorType.CAMERA_DENIED;
        }

        this.showError(errorType);
      }
    }

    stopCamera() {
      if (this.stream) {
        this.stream.getTracks().forEach(track => track.stop());
        this.stream = null;
      }
      const video = document.getElementById('camera-video');
      if (video) {
        video.srcObject = null;
      }
    }

    capturePhoto() {
      const video = document.getElementById('camera-video');
      const canvas = document.createElement('canvas');
      canvas.width = video.videoWidth;
      canvas.height = video.videoHeight;
      const ctx = canvas.getContext('2d');
      ctx.drawImage(video, 0, 0);

      canvas.toBlob((blob) => {
        this.currentImageData = blob;
        const url = URL.createObjectURL(blob);
        this.showPreview(url, true); // Pass true to show flash
        this.stopCamera();
      }, 'image/jpeg', 0.9);
    }

    handleFileSelect(e) {
      const file = e.target.files[0];
      if (!file) return;

      // Validate file type
      if (!file.type.startsWith('image/')) {
        this.showError(ErrorType.INVALID_FILE_TYPE);
        return;
      }

      // Validate file size (10MB limit)
      if (file.size > 10 * 1024 * 1024) {
        this.showError(ErrorType.FILE_TOO_LARGE);
        return;
      }

      this.currentImageData = file;
      const url = URL.createObjectURL(file);
      this.showPreview(url, true); // Add flash animation for uploaded photos
    }

    showPreview(url, showFlash = false) {
      this.showState('preview');
      const previewImage = document.getElementById('preview-image');

      // Add flash effect on preview load if from camera
      if (showFlash) {
        previewImage.style.filter = 'brightness(3)';
        previewImage.style.transition = 'filter 0.4s ease-out';
        previewImage.onload = () => {
          // Bright flash that fades to normal
          setTimeout(() => {
            previewImage.style.filter = 'brightness(1)';
          }, 50);
        };
      }

      previewImage.src = url;
    }

    retakePhoto() {
      this.currentImageData = null;
      this.showState('options');
      const fileInput = document.getElementById('file-input');
      if (fileInput) fileInput.value = '';

      // Ensure preview buttons are visible again
      const previewButtons = document.querySelector('.preview-buttons');
      const processingButtons = document.querySelector('.processing-buttons');

      if (previewButtons) {
        previewButtons.hidden = false;
      }

      if (processingButtons) {
        processingButtons.hidden = true;
      }
    }

    async processTryOn() {
      if (!this.currentImageData || !this.productData) return;

      // Show processing overlay and swap button groups
      const overlay = document.querySelector('.processing-overlay');
      const previewButtons = document.querySelector('.preview-buttons');
      const processingButtons = document.querySelector('.processing-buttons');
      const imageContainer = document.querySelector('.view-preview .image-container');

      if (overlay) {
        overlay.hidden = false;
      }

      if (previewButtons) {
        previewButtons.hidden = true;
      }

      if (processingButtons) {
        processingButtons.hidden = false;
      }

      // Add shake animation to image
      if (imageContainer) {
        imageContainer.classList.add('processing');
      }

      try {
        const formData = new FormData();
        formData.append('personImage', this.currentImageData);

        // Append the single product image
        if (this.productData.image) {
          formData.append('productImage', this.productData.image);
        } else {
          console.error('No product image found in data attribute');
          return this.showError('Product Configuration Error', 'Product image is not properly configured.');
        }

        // Use Shopify App Proxy URL (routes through /apps/banana-tryon)
        const response = await fetch('/apps/banana-tryon/tryon', {
          method: 'POST',
          body: formData,
          credentials: 'same-origin'
        });

        if (!response.ok) {
          const error = await response.json().catch(() => ({}));

          // Handle specific error types
          if (response.status === 429 || error.code === 'USAGE_LIMIT') {
            throw { type: ErrorType.USAGE_LIMIT, message: error.message };
          } else if (response.status >= 500) {
            throw { type: ErrorType.PROCESSING_ERROR, message: error.message };
          } else {
            throw { type: ErrorType.NETWORK_ERROR, message: error.message };
          }
        }

        const data = await response.json();

        // Hide processing overlay before showing result
        if (overlay) {
          overlay.hidden = true;
        }

        // Remove shake animation
        if (imageContainer) {
          imageContainer.classList.remove('processing');
        }

        this.showResult(data.resultImage);

      } catch (err) {
        console.error('Processing error:', err);

        // Hide processing overlay and restore preview buttons on error
        const overlay = document.querySelector('.processing-overlay');
        const previewButtons = document.querySelector('.preview-buttons');
        const processingButtons = document.querySelector('.processing-buttons');
        const imageContainer = document.querySelector('.view-preview .image-container');

        if (overlay) {
          overlay.hidden = true;
        }

        if (previewButtons) {
          previewButtons.hidden = false;
        }

        if (processingButtons) {
          processingButtons.hidden = true;
        }

        // Remove shake animation
        if (imageContainer) {
          imageContainer.classList.remove('processing');
        }

        if (err.type) {
          this.showError(err.type, err.message);
        } else if (err.name === 'TypeError' && err.message.includes('fetch')) {
          this.showError(ErrorType.NETWORK_ERROR);
        } else {
          this.showError(ErrorType.UNKNOWN);
        }
      }
    }

    cancelProcessing() {
      // Stop any ongoing processing
      this.retakePhoto();
    }

    showResult(imageUrl) {
      this.showState('result');
      const resultImage = document.getElementById('result-image');

      // Brightness flash effect for result image
      resultImage.style.filter = 'brightness(2)';
      resultImage.style.transition = 'filter 0.5s ease-out';
      resultImage.onload = () => {
        setTimeout(() => {
          resultImage.style.filter = 'brightness(1)';
        }, 50);
      };

      resultImage.src = imageUrl;
    }

    async addToCart() {
      try {
        // Show loading state on button
        const addToCartBtn = document.getElementById('add-to-cart') ||
                            document.getElementById('add-to-cart-processing');

        // Store original button content
        if (addToCartBtn) {
          // Save original content to data attribute for restoration
          if (!addToCartBtn.dataset.originalContent) {
            addToCartBtn.dataset.originalContent = addToCartBtn.innerHTML;
          }
          addToCartBtn.disabled = true;
          addToCartBtn.innerHTML = '<span class="spinner"></span> Adding...';
        }

        // Use Shopify's AJAX API with locale-aware URL
        const formData = {
          items: [{
            id: parseInt(this.productData.variantId),
            quantity: 1
          }]
        };

        const response = await fetch(window.Shopify.routes.root + 'cart/add.js', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(formData)
        });

        if (!response.ok) {
          // Handle specific cart errors
          const errorData = await response.json();
          if (response.status === 422) {
            // Product/stock specific errors
            throw new Error(errorData.description || errorData.message || 'Unable to add item to cart');
          }
          throw new Error('Failed to add to cart');
        }

        // Success
        const data = await response.json();

        // Update cart count if element exists
        const cartCountSelectors = [
          '.cart-count',
          '.cart-count-bubble',
          '[data-cart-count]',
          '.site-header__cart-count',
          '.cart-link__bubble',
          '.cart__count',
          '#CartCount',
          '.js-cart-item-count',
          '.cart-item-count'
        ];

        const cartCounts = document.querySelectorAll(cartCountSelectors.join(','));
        if (cartCounts.length > 0) {
          // Fetch current cart to get total item count
          const cartResponse = await fetch(window.Shopify.routes.root + 'cart.js');
          if (cartResponse.ok) {
            const cartData = await cartResponse.json();
            cartCounts.forEach(el => {
              // Update text content
              el.textContent = cartData.item_count;

              // Update various attributes that themes might use
              if (el.hasAttribute('data-cart-count')) {
                el.setAttribute('data-cart-count', cartData.item_count);
              }
              if (el.hasAttribute('aria-label')) {
                el.setAttribute('aria-label', `${cartData.item_count} items`);
              }

              // Show/hide based on count
              if (cartData.item_count > 0) {
                el.classList.remove('hidden', 'hide');
              }
            });
          }
        }

        // Trigger standard Shopify cart events for theme compatibility
        document.dispatchEvent(new CustomEvent('cart:added', {
          detail: { items: data.items }
        }));

        // Also trigger ajaxCart events used by many themes
        if (typeof jQuery !== 'undefined') {
          /* global jQuery */
          jQuery(document).trigger('ajaxCart:added', data);
        }

        // Close modal immediately
        this.closeModal();

        // Open cart drawer if it exists (common in modern themes)
        const cartDrawerSelectors = [
          '[data-cart-drawer-trigger]',
          '.js-drawer-open-cart',
          '.cart-drawer-toggle',
          '.js-cart-drawer-trigger',
          '[data-action="open-drawer"]',
          '.cart-link[data-open-drawer]',
          '#cart-icon-bubble',
          '.site-header__cart',
          'cart-drawer',
          'cart-notification'
        ];

        for (const selector of cartDrawerSelectors) {
          const trigger = document.querySelector(selector);
          if (trigger) {
            // Some elements need different interaction methods
            if (trigger.tagName === 'CART-DRAWER' || trigger.tagName === 'CART-NOTIFICATION') {
              // Web components might have open methods
              if (typeof trigger.open === 'function') {
                trigger.open();
              } else {
                trigger.classList.add('active', 'is-open');
              }
            } else {
              trigger.click();
            }
            break;
          }
        }

      } catch (err) {
        console.error('Add to cart error:', err);

        // Reset button state
        const resetBtn = document.getElementById('add-to-cart') ||
                         document.getElementById('add-to-cart-processing');
        if (resetBtn) {
          resetBtn.disabled = false;
          // Try to restore original content if we saved it earlier
          const originalContent = resetBtn.dataset.originalContent || `
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <path d="M1 1h4l2.68 13.39a2 2 0 0 0 2 1.61h9.72a2 2 0 0 0 2-1.61L23 6H6"></path>
              <circle cx="9" cy="21" r="1"></circle>
              <circle cx="20" cy="21" r="1"></circle>
            </svg>
            <span>Add to cart</span>
          `;
          resetBtn.innerHTML = originalContent;
        }

        this.showError('Add to Cart Error', err.message || 'Could not add to cart. Please try again.');
      }
    }

    showError(errorType, customMessage = null) {
      const errorConfig = ErrorMessages[errorType] || ErrorMessages[ErrorType.UNKNOWN];

      this.showState('error');

      const errorTitle = this.modal.querySelector('.error-title');
      const errorMessage = this.modal.querySelector('.error-message');
      const errorRetry = document.getElementById('error-retry');

      if (errorTitle) {
        errorTitle.textContent = errorConfig.title;
      }

      if (errorMessage) {
        errorMessage.textContent = customMessage || errorConfig.message;
      }

      // Show/hide retry button based on error type
      if (errorRetry) {
        errorRetry.style.display = errorConfig.canRetry ? 'inline-flex' : 'none';
      }
    }
  }

  // Initialize when DOM is ready
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => new VirtualTryOn());
  } else {
    new VirtualTryOn();
  }
})();