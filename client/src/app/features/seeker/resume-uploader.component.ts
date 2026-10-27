import { Component, inject, model, signal, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { UploadService } from '../../core/services/upload.service';

@Component({
  selector: 'app-resume-uploader',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <div class="resume-uploader-card">
      <label class="block-title">
        <span class="title-text">Resume / Curriculum Vitae</span>
        <span class="required-badge">* Required (PDF, DOCX up to 10MB)</span>
      </label>

      <!-- If no file is uploaded or currently being uploaded -->
      @if (!uploadedUrl() && !isUploading()) {
        <div 
          class="dropzone"
          [class.drag-over]="isDragging()"
          (dragover)="onDragOver($event)"
          (dragleave)="onDragLeave($event)"
          (drop)="onDrop($event)"
          (click)="fileInput.click()">
          
          <input 
            #fileInput 
            type="file" 
            class="hidden-file-input" 
            accept=".pdf,.docx,application/pdf,application/vnd.openxmlformats-officedocument.wordprocessingml.document"
            (change)="onFileSelected($event)" />

          <div class="dropzone-content">
            <div class="icon-orb">
              <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/>
                <polyline points="17 8 12 3 7 8"/>
                <line x1="12" y1="3" x2="12" y2="15"/>
              </svg>
            </div>

            <div class="drop-text-group">
              <span class="main-drop-text">
                <strong>Click to browse</strong> or drag & drop your resume here
              </span>
              <span class="sub-drop-text">
                PDF or DOCX (up to 10MB)
              </span>
            </div>

            <div class="badge-row">
              <span class="format-pill pdf">PDF</span>
              <span class="format-pill docx">DOCX</span>
            </div>
          </div>
        </div>

        <!-- Optional URL Switcher -->
        <div class="alt-url-toggle">
          <button type="button" class="btn-link" (click)="showManualInput.set(!showManualInput())">
            {{ showManualInput() ? '← Back to file upload' : 'Prefer entering a public portfolio / Google Drive link?' }}
          </button>

          @if (showManualInput()) {
            <div class="manual-url-box animate-fade-in">
              <input 
                type="url" 
                class="manual-input"
                [ngModel]="uploadedUrl()" 
                (ngModelChange)="onManualUrlChange($event)"
                placeholder="https://drive.google.com/file/d/... or https://portfolio.dev/resume.pdf" />
            </div>
          }
        </div>
      }

      <!-- Uploading State with Animated Progress -->
      @if (isUploading()) {
        <div class="uploading-panel glass-panel">
          <div class="uploading-header">
            <div class="file-info-mini">
              <div class="spinner-sm"></div>
              <span class="uploading-name">{{ currentFileName() }}</span>
            </div>
            <span class="percentage">{{ uploadProgress() }}%</span>
          </div>

          <div class="progress-track">
            <div class="progress-bar-fill" [style.width.%]="uploadProgress()"></div>
          </div>

          <div class="upload-status-sub">
            <span>Uploading document to secure storage...</span>
            <span>{{ formattedCurrentFileSize() }}</span>
          </div>
        </div>
      }

      <!-- Uploaded Success File Card -->
      @if (uploadedUrl() && !isUploading()) {
        <div class="uploaded-file-card glass-panel-glow animate-fade-in">
          <div class="file-card-main">
            <div class="file-icon-badge" [class.is-pdf]="isPdf()" [class.is-doc]="!isPdf()">
              <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/>
                <polyline points="14 2 14 8 20 8"/>
                <line x1="16" y1="13" x2="8" y2="13"/>
                <line x1="16" y1="17" x2="8" y2="17"/>
              </svg>
              <span class="file-ext-tag">{{ fileExtension() }}</span>
            </div>

            <div class="file-meta">
              <span class="file-name" [title]="displayName()">{{ displayName() }}</span>
              <div class="meta-sub">
                <span class="status-verified">
                  <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3">
                    <polyline points="20 6 9 17 4 12"/>
                  </svg>
                  Ready for Employer Review
                </span>
                @if (fileSizeDisplay()) {
                  <span class="dot-sep">•</span>
                  <span class="file-size">{{ fileSizeDisplay() }}</span>
                }
              </div>
            </div>
          </div>

          <div class="file-actions">
            <!-- View / Preview Button -->
            <a 
              [href]="uploadedUrl()" 
              target="_blank" 
              rel="noopener noreferrer" 
              class="btn-action btn-preview"
              title="Preview resume document">
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/>
                <circle cx="12" cy="12" r="3"/>
              </svg>
              <span>Preview</span>
            </a>

            <!-- Replace Button -->
            <button 
              type="button" 
              class="btn-action btn-replace" 
              (click)="fileInputHidden.click()"
              title="Replace document">
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <polyline points="23 4 23 10 17 10"/>
                <polyline points="1 20 1 14 7 14"/>
                <path d="M3.51 9a9 9 0 0 1 14.85-3.36L23 10M1 14l4.64 4.36A9 9 0 0 0 20.49 15"/>
              </svg>
              <span>Replace</span>
            </button>

            <!-- Remove Button -->
            <button 
              type="button" 
              class="btn-action btn-remove" 
              (click)="removeFile()"
              title="Remove file">
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <line x1="18" y1="6" x2="6" y2="18"/>
                <line x1="6" y1="6" x2="18" y2="18"/>
              </svg>
            </button>

            <input 
              #fileInputHidden
              type="file" 
              class="hidden-file-input" 
              accept=".pdf,.doc,.docx"
              (change)="onFileSelected($event)" />
          </div>
        </div>
      }

      <!-- Error Banner -->
      @if (errorMessage()) {
        <div class="error-banner animate-fade-in">
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <circle cx="12" cy="12" r="10"/>
            <line x1="12" y1="8" x2="12" y2="12"/>
            <line x1="12" y1="16" x2="12.01" y2="16"/>
          </svg>
          <span>{{ errorMessage() }}</span>
          <button type="button" class="btn-dismiss" (click)="errorMessage.set(null)">×</button>
        </div>
      }
    </div>
  `,
  styles: [`
    .resume-uploader-card {
      display: flex;
      flex-direction: column;
      gap: 0.6rem;
      width: 100%;
    }

    .block-title {
      display: flex;
      justify-content: space-between;
      align-items: center;
      font-size: 0.85rem;
    }

    .title-text {
      font-weight: 600;
      color: var(--text-primary, #f1f5f9);
    }

    .required-badge {
      font-size: 0.72rem;
      color: var(--text-muted, #94a3b8);
    }

    .hidden-file-input {
      display: none;
    }

    /* Dropzone */
    .dropzone {
      border: 2px dashed rgba(56, 189, 248, 0.25);
      background: rgba(15, 23, 42, 0.45);
      backdrop-filter: blur(8px);
      border-radius: 12px;
      padding: 1.75rem 1.25rem;
      text-align: center;
      cursor: pointer;
      transition: all 0.25s cubic-bezier(0.16, 1, 0.3, 1);
      position: relative;
    }

    .dropzone:hover {
      border-color: rgba(56, 189, 248, 0.6);
      background: rgba(15, 23, 42, 0.7);
      box-shadow: 0 0 20px rgba(56, 189, 248, 0.12);
      transform: translateY(-1px);
    }

    .dropzone.drag-over {
      border-color: #38bdf8;
      background: rgba(56, 189, 248, 0.1);
      box-shadow: 0 0 30px rgba(56, 189, 248, 0.25);
      transform: scale(1.01);
    }

    .dropzone-content {
      display: flex;
      flex-direction: column;
      align-items: center;
      gap: 0.75rem;
    }

    .icon-orb {
      width: 52px;
      height: 52px;
      border-radius: 50%;
      background: linear-gradient(135deg, rgba(56, 189, 248, 0.15), rgba(129, 140, 248, 0.2));
      border: 1px solid rgba(56, 189, 248, 0.3);
      display: flex;
      align-items: center;
      justify-content: center;
      color: #38bdf8;
      box-shadow: 0 4px 15px rgba(56, 189, 248, 0.15);
      transition: transform 0.2s ease;
    }

    .dropzone:hover .icon-orb {
      transform: scale(1.08);
      color: #7dd3fc;
    }

    .drop-text-group {
      display: flex;
      flex-direction: column;
      gap: 0.25rem;
    }

    .main-drop-text {
      font-size: 0.95rem;
      color: var(--text-primary, #f1f5f9);
    }

    .main-drop-text strong {
      color: #38bdf8;
    }

    .sub-drop-text {
      font-size: 0.75rem;
      color: var(--text-muted, #94a3b8);
    }

    .badge-row {
      display: flex;
      gap: 0.4rem;
      margin-top: 0.25rem;
    }

    .format-pill {
      font-size: 0.65rem;
      font-weight: 700;
      padding: 0.15rem 0.5rem;
      border-radius: 4px;
      letter-spacing: 0.04em;
    }

    .format-pill.pdf {
      background: rgba(239, 68, 68, 0.15);
      color: #f87171;
      border: 1px solid rgba(239, 68, 68, 0.3);
    }

    .format-pill.docx, .format-pill.doc {
      background: rgba(59, 130, 246, 0.15);
      color: #60a5fa;
      border: 1px solid rgba(59, 130, 246, 0.3);
    }

    /* Alt URL */
    .alt-url-toggle {
      display: flex;
      flex-direction: column;
      gap: 0.4rem;
    }

    .btn-link {
      background: none;
      border: none;
      color: var(--text-muted, #94a3b8);
      font-size: 0.75rem;
      text-align: left;
      cursor: pointer;
      padding: 0.2rem 0;
      transition: color 0.15s ease;
      text-decoration: underline;
    }

    .btn-link:hover {
      color: #38bdf8;
    }

    .manual-input {
      width: 100%;
      background: rgba(15, 23, 42, 0.6);
      border: 1px solid rgba(56, 189, 248, 0.2);
      border-radius: 8px;
      padding: 0.55rem 0.75rem;
      color: #f8fafc;
      font-size: 0.82rem;
      outline: none;
      transition: border-color 0.2s;
    }

    .manual-input:focus {
      border-color: #38bdf8;
      box-shadow: 0 0 10px rgba(56, 189, 248, 0.2);
    }

    /* Uploading State */
    .uploading-panel {
      padding: 1rem 1.25rem;
      border-radius: 12px;
      background: rgba(15, 23, 42, 0.75);
      border: 1px solid rgba(56, 189, 248, 0.3);
      display: flex;
      flex-direction: column;
      gap: 0.6rem;
    }

    .uploading-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
    }

    .file-info-mini {
      display: flex;
      align-items: center;
      gap: 0.5rem;
    }

    .spinner-sm {
      width: 16px;
      height: 16px;
      border: 2px solid rgba(56, 189, 248, 0.2);
      border-top-color: #38bdf8;
      border-radius: 50%;
      animation: spin 0.8s linear infinite;
    }

    @keyframes spin {
      to { transform: rotate(360deg); }
    }

    .uploading-name {
      font-size: 0.82rem;
      font-weight: 500;
      color: #f1f5f9;
      max-width: 250px;
      overflow: hidden;
      text-overflow: ellipsis;
      white-space: nowrap;
    }

    .percentage {
      font-size: 0.82rem;
      font-weight: 700;
      color: #38bdf8;
      font-variant-numeric: tabular-nums;
    }

    .progress-track {
      width: 100%;
      height: 6px;
      background: rgba(255, 255, 255, 0.08);
      border-radius: 3px;
      overflow: hidden;
    }

    .progress-bar-fill {
      height: 100%;
      background: linear-gradient(90deg, #38bdf8, #818cf8);
      border-radius: 3px;
      transition: width 0.2s ease-out;
      box-shadow: 0 0 10px rgba(56, 189, 248, 0.5);
    }

    .upload-status-sub {
      display: flex;
      justify-content: space-between;
      font-size: 0.72rem;
      color: var(--text-muted, #94a3b8);
    }

    /* Uploaded File Card */
    .uploaded-file-card {
      display: flex;
      justify-content: space-between;
      align-items: center;
      padding: 0.85rem 1.1rem;
      border-radius: 12px;
      background: rgba(15, 23, 42, 0.8);
      border: 1px solid rgba(34, 197, 94, 0.3);
      box-shadow: 0 4px 20px rgba(34, 197, 94, 0.08);
      gap: 1rem;
    }

    .file-card-main {
      display: flex;
      align-items: center;
      gap: 0.85rem;
      min-width: 0;
    }

    .file-icon-badge {
      width: 42px;
      height: 42px;
      border-radius: 10px;
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: center;
      flex-shrink: 0;
      position: relative;
    }

    .file-icon-badge.is-pdf {
      background: rgba(239, 68, 68, 0.15);
      border: 1px solid rgba(239, 68, 68, 0.35);
      color: #f87171;
    }

    .file-icon-badge.is-doc {
      background: rgba(59, 130, 246, 0.15);
      border: 1px solid rgba(59, 130, 246, 0.35);
      color: #60a5fa;
    }

    .file-ext-tag {
      font-size: 0.55rem;
      font-weight: 800;
      letter-spacing: 0.05em;
      margin-top: -2px;
    }

    .file-meta {
      display: flex;
      flex-direction: column;
      gap: 0.2rem;
      min-width: 0;
    }

    .file-name {
      font-size: 0.88rem;
      font-weight: 600;
      color: #f8fafc;
      white-space: nowrap;
      overflow: hidden;
      text-overflow: ellipsis;
      max-width: 260px;
    }

    .meta-sub {
      display: flex;
      align-items: center;
      gap: 0.4rem;
      font-size: 0.72rem;
      color: var(--text-muted, #94a3b8);
    }

    .status-verified {
      display: flex;
      align-items: center;
      gap: 0.25rem;
      color: #4ade80;
      font-weight: 500;
    }

    .dot-sep {
      color: rgba(255, 255, 255, 0.2);
    }

    .file-actions {
      display: flex;
      align-items: center;
      gap: 0.4rem;
      flex-shrink: 0;
    }

    .btn-action {
      display: inline-flex;
      align-items: center;
      gap: 0.3rem;
      padding: 0.35rem 0.65rem;
      border-radius: 6px;
      font-size: 0.75rem;
      font-weight: 500;
      cursor: pointer;
      text-decoration: none;
      transition: all 0.15s ease;
      border: 1px solid transparent;
    }

    .btn-preview {
      background: rgba(56, 189, 248, 0.15);
      border-color: rgba(56, 189, 248, 0.3);
      color: #38bdf8;
    }

    .btn-preview:hover {
      background: rgba(56, 189, 248, 0.25);
      color: #7dd3fc;
    }

    .btn-replace {
      background: rgba(255, 255, 255, 0.06);
      border-color: rgba(255, 255, 255, 0.12);
      color: var(--text-secondary, #cbd5e1);
    }

    .btn-replace:hover {
      background: rgba(255, 255, 255, 0.12);
      color: #f8fafc;
    }

    .btn-remove {
      background: rgba(239, 68, 68, 0.1);
      border-color: rgba(239, 68, 68, 0.2);
      color: #f87171;
      padding: 0.35rem 0.45rem;
    }

    .btn-remove:hover {
      background: rgba(239, 68, 68, 0.2);
      color: #ef4444;
    }

    /* Error Banner */
    .error-banner {
      display: flex;
      align-items: center;
      gap: 0.5rem;
      padding: 0.6rem 0.85rem;
      background: rgba(239, 68, 68, 0.15);
      border: 1px solid rgba(239, 68, 68, 0.35);
      border-radius: 8px;
      color: #fca5a5;
      font-size: 0.78rem;
    }

    .btn-dismiss {
      margin-left: auto;
      background: none;
      border: none;
      color: #fca5a5;
      font-size: 1.1rem;
      cursor: pointer;
      padding: 0 0.25rem;
    }
  `]
})
export class ResumeUploaderComponent {
  private readonly uploadService = inject(UploadService);

  // Two-way bindings with parent
  public readonly uploadedUrl = model<string>('');
  public readonly originalFileName = model<string>('');

  // Internal reactive signals
  public readonly isDragging = signal(false);
  public readonly isUploading = signal(false);
  public readonly uploadProgress = signal(0);
  public readonly errorMessage = signal<string | null>(null);
  public readonly showManualInput = signal(false);
  public readonly currentFileName = signal('');
  public readonly currentFileSize = signal<number | null>(null);

  // Derived computeds
  public readonly isPdf = computed(() => {
    const url = this.uploadedUrl()?.toLowerCase() || '';
    const name = this.originalFileName()?.toLowerCase() || '';
    return url.endsWith('.pdf') || name.endsWith('.pdf');
  });

  public readonly fileExtension = computed(() => {
    const name = this.originalFileName() || this.uploadedUrl() || '';
    const parts = name.split('.');
    return parts.length > 1 ? parts.pop()!.toUpperCase().substring(0, 4) : 'PDF';
  });

  public readonly displayName = computed(() => {
    if (this.originalFileName()) return this.originalFileName();
    if (this.uploadedUrl()) {
      const parts = this.uploadedUrl().split('/');
      return parts[parts.length - 1] || 'resume-document.pdf';
    }
    return 'resume.pdf';
  });

  public readonly fileSizeDisplay = computed(() => {
    const size = this.currentFileSize();
    if (!size) return null;
    if (size < 1024) return `${size} B`;
    if (size < 1024 * 1024) return `${(size / 1024).toFixed(1)} KB`;
    return `${(size / (1024 * 1024)).toFixed(1)} MB`;
  });

  public readonly formattedCurrentFileSize = computed(() => {
    const size = this.currentFileSize();
    return size ? this.fileSizeDisplay() : '';
  });

  onDragOver(event: DragEvent) {
    event.preventDefault();
    event.stopPropagation();
    this.isDragging.set(true);
  }

  onDragLeave(event: DragEvent) {
    event.preventDefault();
    event.stopPropagation();
    this.isDragging.set(false);
  }

  onDrop(event: DragEvent) {
    event.preventDefault();
    event.stopPropagation();
    this.isDragging.set(false);

    if (event.dataTransfer?.files && event.dataTransfer.files.length > 0) {
      this.handleFile(event.dataTransfer.files[0]);
    }
  }

  onFileSelected(event: Event) {
    const input = event.target as HTMLInputElement;
    if (input.files && input.files.length > 0) {
      this.handleFile(input.files[0]);
      input.value = '';
    }
  }

  private handleFile(file: File) {
    this.errorMessage.set(null);

    // Validate size (10 MB max)
    const maxBytes = 10 * 1024 * 1024;
    if (file.size > maxBytes) {
      this.errorMessage.set('Document exceeds 10 MB limit. Please select a smaller resume file.');
      return;
    }

    // Validate format
    const lowerName = file.name.toLowerCase();
    const validExtensions = ['.pdf', '.doc', '.docx'];
    const hasValidExt = validExtensions.some(ext => lowerName.endsWith(ext));

    if (!hasValidExt) {
      this.errorMessage.set('Invalid file type. Only PDF (.pdf) and Word documents (.doc, .docx) are supported.');
      return;
    }

    this.currentFileName.set(file.name);
    this.currentFileSize.set(file.size);
    this.isUploading.set(true);
    this.uploadProgress.set(10);

    this.uploadService.uploadWithProgress(file, 'resumes').subscribe({
      next: (event) => {
        this.uploadProgress.set(event.progress);
        if (event.response) {
          this.uploadedUrl.set(event.response.url);
          this.originalFileName.set(event.response.fileName);
          this.isUploading.set(false);
        }
      },
      error: (err) => {
        this.isUploading.set(false);
        const errDetail = err.error?.error || 'Failed to upload document. Please try again.';
        this.errorMessage.set(errDetail);
      }
    });
  }

  onManualUrlChange(url: string) {
    this.uploadedUrl.set(url);
    if (url) {
      this.originalFileName.set(url.split('/').pop() || 'external-resume.pdf');
    }
  }

  removeFile() {
    this.uploadedUrl.set('');
    this.originalFileName.set('');
    this.currentFileSize.set(null);
    this.errorMessage.set(null);
  }
}
