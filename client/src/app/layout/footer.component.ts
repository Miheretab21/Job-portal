import { Component, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-footer',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <footer class="footer-wrapper">
      <div class="footer-container">
        <!-- Main Product Columns -->
        <div class="footer-grid">
          <!-- Brand & Newsletter Column -->
          <div class="footer-brand-col">
            <span class="footer-logo">Career<span class="text-gradient">Orbit</span></span>
            <p class="footer-tagline">
              The high-conviction Ethiopian career platform connecting top professionals across banking, healthcare, development, education, engineering, and technology with verified organizations.
            </p>

            <!-- Newsletter Signup -->
            <div class="newsletter-box">
              <span class="newsletter-title">Stay in the orbit</span>
              <p class="newsletter-sub">Weekly verified role drops across Ethiopia & Worldwide Remote.</p>
              <form class="newsletter-form" (submit)="onSubscribe($event)">
                <input 
                  type="email" 
                  class="newsletter-input" 
                  placeholder="your.email@example.com" 
                  [(ngModel)]="newsletterEmail" 
                  name="newsletterEmail"
                  required
                  aria-label="Email address for newsletter" />
                <button type="submit" class="btn btn-primary newsletter-btn">
                  @if (isSubscribed()) {
                    <span>Subscribed! ✓</span>
                  } @else {
                    <span>Join</span>
                  }
                </button>
              </form>
            </div>
          </div>

          <!-- Candidates Column -->
          <div class="footer-links-col">
            <h4 class="col-title">Candidates</h4>
            <ul class="col-links">
              <li><a href="#jobs">Explore Verified Jobs</a></li>
              <li><a href="#categories">Browse by Category</a></li>
              <li><a href="#how-it-works">How It Works</a></li>
              <li><a href="#jobs">Remote Roles Worldwide</a></li>
              <li><button type="button" class="footer-link-btn" (click)="openDoc('salary')">Salary Transparency Guide</button></li>
            </ul>
          </div>

          <!-- Employers Column -->
          <div class="footer-links-col">
            <h4 class="col-title">Employers</h4>
            <ul class="col-links">
              <li><a href="#for-employers">Post a Requisition</a></li>
              <li><a href="#for-employers">Kanban Candidate Pipeline</a></li>
              <li><a href="#for-employers">AI ATS Compatibility Scoring</a></li>
              <li><a href="#companies">Featured Teams Program</a></li>
              <li><button type="button" class="footer-link-btn" (click)="openDoc('contact')">Employer Inquiries & Support</button></li>
            </ul>
          </div>

          <!-- Company & Legal Column -->
          <div class="footer-links-col">
            <h4 class="col-title">Company & Legal</h4>
            <ul class="col-links">
              <li><button type="button" class="footer-link-btn" (click)="openDoc('about')">About CareerOrbit</button></li>
              <li><button type="button" class="footer-link-btn" (click)="openDoc('contact')">Contact Support</button></li>
              <li><button type="button" class="footer-link-btn" (click)="openDoc('privacy')">Privacy Policy</button></li>
              <li><button type="button" class="footer-link-btn" (click)="openDoc('terms')">Terms of Service</button></li>
              <li><button type="button" class="footer-link-btn" (click)="openDoc('security')">Security & Verification</button></li>
            </ul>
          </div>

          <!-- Resources & Platform Column (Non-duplicated, working links) -->
          <div class="footer-links-col">
            <h4 class="col-title">Resources & Docs</h4>
            <ul class="col-links">
              <li><button type="button" class="footer-link-btn" (click)="openDoc('architecture')">Architecture & Stack Spec</button></li>
              <li><button type="button" class="footer-link-btn" (click)="openDoc('salary')">2026 Compensation Index</button></li>
              <li><button type="button" class="footer-link-btn" (click)="openDoc('security')">Employer Standards</button></li>
              <li><button type="button" class="footer-link-btn" (click)="openDoc('privacy')">Candidate Data Rights</button></li>
              <li><button type="button" class="footer-link-btn" (click)="openDoc('contact')">Direct Support Desk</button></li>
            </ul>
          </div>
        </div>

        <!-- Social Links & Copyright -->
        <div class="footer-middle-bar">
          <p class="copy-text">© 2026 CareerOrbit Inc. Demo project, sample data · Built for portfolio & showcase purposes.</p>
          <div class="social-links-row">
            <a href="https://linkedin.com" target="_blank" rel="noopener" class="social-icon-btn" aria-label="CareerOrbit on LinkedIn" title="LinkedIn">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
                <path d="M19 0h-14c-2.761 0-5 2.239-5 5v14c0 2.761 2.239 5 5 5h14c2.762 0 5-2.239 5-5v-14c0-2.761-2.238-5-5-5zm-11 19h-3v-11h3v11zm-1.5-12.268c-.966 0-1.75-.79-1.75-1.764s.784-1.764 1.75-1.764 1.75.79 1.75 1.764-.783 1.764-1.75 1.764zm13.5 12.268h-3v-5.604c0-3.368-4-3.113-4 0v5.604h-3v-11h3v1.765c1.396-2.586 7-2.777 7 2.476v6.759z"/>
              </svg>
            </a>
            <a href="https://t.me" target="_blank" rel="noopener" class="social-icon-btn" aria-label="CareerOrbit on Telegram" title="Telegram Channel">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
                <path d="M12 0c-6.627 0-12 5.373-12 12s5.373 12 12 12 12-5.373 12-12-5.373-12-12-12zm5.894 8.221l-1.97 9.28c-.145.658-.537.818-1.084.508l-3-2.21-1.446 1.394c-.14.18-.357.295-.6.295-.002 0-.003 0-.005 0l.213-3.054 5.56-5.022c.24-.213-.054-.334-.373-.121l-6.869 4.326-2.96-.924c-.643-.204-.657-.643.136-.953l11.57-4.461c.537-.194 1.006.131.828.942z"/>
              </svg>
            </a>
            <a href="https://github.com" target="_blank" rel="noopener" class="social-icon-btn" aria-label="CareerOrbit on GitHub" title="GitHub Repository">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
                <path fill-rule="evenodd" clip-rule="evenodd" d="M12 2C6.477 2 2 6.484 2 12.017c0 4.425 2.865 8.18 6.839 9.504.5.092.682-.217.682-.483 0-.237-.008-.868-.013-1.703-2.782.605-3.369-1.343-3.369-1.343-.454-1.158-1.11-1.466-1.11-1.466-.908-.62.069-.608.069-.608 1.003.07 1.53 1.032 1.53 1.032.892 1.53 2.341 1.088 2.91.832.092-.647.35-1.088.636-1.338-2.22-.253-4.555-1.113-4.555-4.951 0-1.093.39-1.988 1.029-2.688-.103-.253-.446-1.272.098-2.65 0 0 .84-.27 2.75 1.026A9.564 9.564 0 0112 6.844c.85.004 1.705.115 2.504.337 1.909-1.296 2.747-1.027 2.747-1.027.546 1.379.202 2.398.1 2.651.64.7 1.028 1.595 1.028 2.688 0 3.848-2.339 4.695-4.566 4.943.359.309.678.92.678 1.855 0 1.338-.012 2.419-.012 2.747 0 .268.18.58.688.482A10.019 10.019 0 0022 12.017C22 6.484 17.522 2 12 2z"/>
              </svg>
            </a>
            <a href="https://twitter.com" target="_blank" rel="noopener" class="social-icon-btn" aria-label="CareerOrbit on X" title="X (Twitter)">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
                <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z"/>
              </svg>
            </a>
          </div>
        </div>

        <!-- Dedicated Portfolio & Engineering Architecture Showcase Box -->
        <div class="portfolio-engineering-bar">
          <div class="portfolio-header">
            <span class="portfolio-tag">⚡ PORTFOLIO & ARCHITECTURE SHOWCASE</span>
            <span class="portfolio-note">Full-Stack .NET 10 LTS & Angular 22 Solution</span>
          </div>
          <div class="portfolio-pills">
            <span class="tech-pill">.NET 10 APIs</span>
            <span class="tech-pill">Angular 22 Signals</span>
            <span class="tech-pill">Postgres 18 & EF</span>
            <span class="tech-pill">SignalR Sockets</span>
            <span class="tech-pill">AI ATS Scoring</span>
            <span class="tech-pill">Clean DDD Stack</span>
          </div>
          <div class="portfolio-links">
            <a href="http://localhost:5177/scalar/v1" target="_blank" class="dev-link" title="Explore OpenAPI Specification with Scalar UI">
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/>
                <polyline points="14 2 14 8 20 8"/>
                <line x1="16" y1="13" x2="8" y2="13"/>
                <line x1="16" y1="17" x2="8" y2="17"/>
              </svg>
              <span>Scalar Interactive API Docs</span>
            </a>
            <span class="sep">·</span>
            <a href="http://localhost:5177/health" target="_blank" class="dev-link" title="View Real-Time ASP.NET Core Health Checks">
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <path d="M22 12h-4l-3 9L9 3l-3 9H2"/>
              </svg>
              <span>Live API Health & Telemetry</span>
            </a>
            <span class="sep">·</span>
            <a href="https://github.com" target="_blank" class="dev-link" title="Source Code Repository">
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <circle cx="12" cy="12" r="10"/>
                <path d="m10 15 5-3-5-3v6Z"/>
              </svg>
              <span>GitHub Repository</span>
            </a>
          </div>
        </div>
      </div>

      <!-- Interactive Document Modal for All Legal, About, Terms, and Docs Links -->
      @if (activeDoc()) {
        <div class="modal-backdrop" (click)="closeDoc()">
          <div class="modal-panel glass-panel-glow doc-modal" (click)="$event.stopPropagation()">
            <div class="doc-modal-header">
              <div class="doc-header-left">
                <span class="doc-badge">{{ getDocBadge(activeDoc()!) }}</span>
                <h2 class="doc-title">{{ getDocTitle(activeDoc()!) }}</h2>
                <p class="doc-subtitle">{{ getDocSubtitle(activeDoc()!) }}</p>
              </div>
              <button type="button" class="close-btn" (click)="closeDoc()" aria-label="Close document">
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                  <line x1="18" y1="6" x2="6" y2="18"/>
                  <line x1="6" y1="6" x2="18" y2="18"/>
                </svg>
              </button>
            </div>

            <div class="doc-body">
              @switch (activeDoc()) {
                @case ('about') {
                  <div class="doc-section">
                    <h3>Who We Are</h3>
                    <p>CareerOrbit is the next-generation job and talent platform founded in Addis Ababa, Ethiopia. We connect exceptional software engineers, mobile developers, cloud architects, and product designers with high-conviction companies in East Africa and worldwide.</p>
                  </div>
                  <div class="doc-section">
                    <h3>The Problem We Solve</h3>
                    <p>Traditional job platforms across the region suffer from opaque compensation, ghost requisitions, and recruiter silence. CareerOrbit enforces mandatory upfront pay transparency in ETB (local) and USD (remote/global), transparent candidate pipelines, and real-time application updates.</p>
                  </div>
                  <div class="doc-section">
                    <h3>Technology & Integrity</h3>
                    <p>Built with enterprise-grade Clean Architecture on ASP.NET Core 10 LTS and Angular 22 Zoneless Signals, CareerOrbit provides real-time WebSockets, embedded AI ATS compatibility scoring, and 100% verified employer credentials.</p>
                  </div>
                  <div class="doc-section">
                    <h3>Headquarters & Desk</h3>
                    <p>Orbit Tower, Kazanchis Tech Corridor, Kirkos Sub-City, Addis Ababa, Ethiopia. Direct email: <a href="mailto:support@careerorbit.et">support@careerorbit.et</a>.</p>
                  </div>
                }
                @case ('privacy') {
                  <div class="doc-section">
                    <h3>1. Candidate Data Protection</h3>
                    <p>Your privacy is paramount. We do not sell, rent, or trade candidate personal data, resumes, or contact information to marketing networks, third-party recruiters, or automated scrapers.</p>
                  </div>
                  <div class="doc-section">
                    <h3>2. Profile & Resume Visibility</h3>
                    <p>Your resume and contact information are only accessible to verified employers when you explicitly submit an application. In general exploration mode, your identity remains private until you choose to engage.</p>
                  </div>
                  <div class="doc-section">
                    <h3>3. AI ATS Matching & Privacy</h3>
                    <p>When you use our AI ATS Compatibility Analysis, candidate resume text and role specifications are processed securely with zero training on public LLM models. Your CV is never shared with other candidates.</p>
                  </div>
                  <div class="doc-section">
                    <h3>4. Your Rights</h3>
                    <p>You may export your complete data or permanently delete your profile, applications, and saved roles at any time from your account settings or by emailing <a href="mailto:privacy@careerorbit.et">privacy@careerorbit.et</a>.</p>
                  </div>
                }
                @case ('terms') {
                  <div class="doc-section">
                    <h3>1. Transparent Pay Requirement</h3>
                    <p>Every job requisition on CareerOrbit must state an upfront, verifiable compensation range in either ETB (monthly) or USD (annual). Listings using deceptive "negotiable" placeholders, unpaid trial periods, or commission-only masks are immediately terminated.</p>
                  </div>
                  <div class="doc-section">
                    <h3>2. 100% Free for Candidates</h3>
                    <p>Job seekers will never be charged fees for browsing, creating a profile, running AI compatibility evaluations, applying to positions, or interviewing. Charging candidates for job placement is strictly prohibited on CareerOrbit.</p>
                  </div>
                  <div class="doc-section">
                    <h3>3. Employer Conduct & Legitimacy</h3>
                    <p>Employers must represent genuine corporate entities with verified Ethiopian Ministry of Trade registration or international incorporation. Discriminatory job descriptions, ghost postings, and unsolicited marketing are grounds for permanent account termination.</p>
                  </div>
                  <div class="doc-section">
                    <h3>4. Account Security</h3>
                    <p>Users are responsible for safeguarding login credentials. CareerOrbit implements cryptographic JWT authentication and bcrypt password hashing to protect platform integrity.</p>
                  </div>
                }
                @case ('security') {
                  <div class="doc-section">
                    <h3>1. Multi-Step Employer Vetting</h3>
                    <p>Every employer profile displaying the green verified checkmark has passed our verification protocol: (a) Tax Identification Number (TIN) & Commercial Registration validation, (b) Corporate email domain verification, and (c) Compensation legitimacy review.</p>
                  </div>
                  <div class="doc-section">
                    <h3>2. Infrastructure Security</h3>
                    <p>CareerOrbit runs on modern ASP.NET Core 10 LTS with strict CORS policies, AES-256 data-at-rest encryption, Content Security Policies, rate-limiting on authentication endpoints, and secure HTTP-only cookies.</p>
                  </div>
                  <div class="doc-section">
                    <h3>3. Report Deceptive Postings</h3>
                    <p>If you encounter an employer asking for payment, misrepresenting role compensation, or conducting unauthorized communications, report it immediately to <a href="mailto:security@careerorbit.et">security@careerorbit.et</a> for swift investigation.</p>
                  </div>
                }
                @case ('salary') {
                  <div class="doc-section">
                    <h3>2026 Compensation Standards & Benchmarks</h3>
                    <p>CareerOrbit collects verified compensation bands across Ethiopian tech employers and international remote teams hiring in Africa to provide authentic, market-rate visibility.</p>
                  </div>
                  <div class="doc-section">
                    <h3>Addis Ababa Tech Market (ETB / Month)</h3>
                    <ul class="doc-list">
                      <li><strong>Junior Software Engineer:</strong> ETB 28,000 – 45,000 /mo</li>
                      <li><strong>Mid-Level Full Stack / Mobile:</strong> ETB 50,000 – 85,000 /mo</li>
                      <li><strong>Senior Backend / Cloud Native:</strong> ETB 90,000 – 160,000 /mo</li>
                      <li><strong>Engineering Lead / Architect:</strong> ETB 170,000 – 260,000+ /mo</li>
                    </ul>
                  </div>
                  <div class="doc-section">
                    <h3>Worldwide Remote & FinTech (USD / Year)</h3>
                    <ul class="doc-list">
                      <li><strong>Remote Software Engineer:</strong> $60,000 – $100,000 USD /yr</li>
                      <li><strong>Staff Cloud Native / Platform:</strong> $120,000 – $180,000 USD /yr</li>
                      <li><strong>Lead Product / UI/UX Designer:</strong> $80,000 – $135,000 USD /yr</li>
                      <li><strong>DevOps / Kubernetes Specialist:</strong> $110,000 – $165,000 USD /yr</li>
                    </ul>
                  </div>
                  <div class="doc-section">
                    <h3>Our Compensation Pledge</h3>
                    <p>We reject roles without stated pay. Transparent salary information narrows the wage gap and ensures candidates are evaluated on skills and impact rather than negotiation leverage.</p>
                  </div>
                }
                @case ('contact') {
                  <div class="doc-section">
                    <h3>Direct Platform Support & Inquiries</h3>
                    <p>Whether you're an employer looking to verify your company and post requisitions or a candidate needing assistance with your applications, our Addis Ababa team is here to help.</p>
                  </div>
                  <div class="doc-section">
                    <h3>Direct Contact Channels</h3>
                    <ul class="doc-list">
                      <li><strong>Candidate & General Support:</strong> <a href="mailto:support@careerorbit.et">support@careerorbit.et</a></li>
                      <li><strong>Employer Verification & Postings:</strong> <a href="mailto:partners@careerorbit.et">partners@careerorbit.et</a></li>
                      <li><strong>Direct Phone:</strong> <a href="tel:+251116610000">+251 11 661 0000</a> (Addis Ababa desk)</li>
                      <li><strong>Physical Address:</strong> Orbit Tower, 4th Floor, Kazanchis Tech Corridor, Kirkos Sub-City, Addis Ababa, Ethiopia</li>
                      <li><strong>Operating Hours:</strong> Monday – Friday, 8:30 AM – 6:00 PM EAT (UTC+3)</li>
                    </ul>
                  </div>
                }
                @case ('architecture') {
                  <div class="doc-section">
                    <h3>Full-Stack Clean Architecture Specification</h3>
                    <p>CareerOrbit is built as a production-grade enterprise reference application demonstrating Domain-Driven Design (DDD) and modern engineering best practices across both backend and frontend.</p>
                  </div>
                  <div class="doc-section">
                    <h3>Backend Architecture (.NET 10 LTS)</h3>
                    <ul class="doc-list">
                      <li><strong>Minimal APIs:</strong> Clean endpoint-per-feature routing with type-safe filters.</li>
                      <li><strong>CQRS & MediatR:</strong> Strict segregation of Commands, Queries, and Domain Events.</li>
                      <li><strong>Persistence:</strong> Entity Framework Core 10 with PostgreSQL 18, connection pooling, and optimized migrations.</li>
                      <li><strong>Real-Time:</strong> SignalR WebSockets hub for live application pipeline and status notifications.</li>
                      <li><strong>API Documentation:</strong> Scalar OpenAPI spec interactive documentation hosted at <code>/scalar/v1</code>.</li>
                      <li><strong>Health Checks:</strong> ASP.NET Core Health Checks telemetry hosted at <code>/health</code>.</li>
                    </ul>
                  </div>
                  <div class="doc-section">
                    <h3>Frontend Architecture (Angular 22)</h3>
                    <ul class="doc-list">
                      <li><strong>Zoneless Signals:</strong> 100% fine-grained reactive state with Signals and effect pipelines without Zone.js overhead.</li>
                      <li><strong>Pure Design System:</strong> Curated CSS tokens and CSS grid layouts with zero CSS framework baggage.</li>
                      <li><strong>ATS AI Engine:</strong> Embedded heuristic and neural ATS fit scoring module for real-time candidate CV analysis.</li>
                    </ul>
                  </div>
                }
              }
            </div>

            <div class="doc-modal-footer">
              <span class="doc-footer-note">CareerOrbit Platform · Legal & Transparency Standards</span>
              <button type="button" class="btn btn-primary" (click)="closeDoc()">Close Document</button>
            </div>
          </div>
        </div>
      }
    </footer>
  `,
  styles: [`
    .footer-wrapper {
      margin-top: 4rem;
      border-top: 1px solid var(--border-subtle);
      background: var(--bg-surface);
      padding: 4.5rem 1.5rem 2.5rem;
      transition: background-color var(--transition-normal), border-color var(--transition-normal);
    }
    .footer-container {
      max-width: 1280px;
      margin: 0 auto;
    }
    .footer-grid {
      display: grid;
      grid-template-columns: 2fr 1fr 1fr 1fr 1fr;
      gap: 2.5rem;
      padding-bottom: 2.5rem;
      border-bottom: 1px solid var(--border-subtle);
    }
    .footer-logo {
      font-size: 1.45rem;
      font-weight: 800;
      letter-spacing: -0.02em;
      color: var(--text-primary);
    }
    .footer-tagline {
      color: var(--text-secondary);
      font-size: 0.9rem;
      max-width: 380px;
      margin: 0.85rem 0 1.25rem;
      line-height: 1.6;
    }
    .newsletter-box {
      margin-top: 1rem;
      max-width: 380px;
    }
    .newsletter-title {
      font-size: 0.825rem;
      font-weight: 700;
      color: var(--text-primary);
      text-transform: uppercase;
      letter-spacing: 0.05em;
    }
    .newsletter-sub {
      font-size: 0.775rem;
      color: var(--text-muted);
      margin: 0.35rem 0 0.75rem;
      line-height: 1.4;
    }
    .newsletter-form {
      display: flex;
      gap: 0.5rem;
    }
    .newsletter-input {
      flex: 1;
      padding: 0.5rem 0.85rem;
      background: var(--bg-card);
      border: 1px solid var(--border-card);
      border-radius: var(--radius-md);
      color: var(--text-primary);
      font-size: 0.85rem;
      outline: none;
      transition: border-color var(--transition-fast);
    }
    .newsletter-input:focus {
      border-color: var(--accent-primary);
    }
    .newsletter-btn {
      padding: 0.5rem 1rem;
      font-size: 0.825rem;
      white-space: nowrap;
    }
    .col-title {
      font-size: 0.85rem;
      font-weight: 700;
      color: var(--text-primary);
      text-transform: uppercase;
      letter-spacing: 0.05em;
      margin-bottom: 1.25rem;
    }
    .col-links {
      list-style: none;
      display: flex;
      flex-direction: column;
      gap: 0.75rem;
      padding: 0;
      margin: 0;
    }
    .col-links a,
    .footer-link-btn {
      font-family: inherit;
      font-size: 0.875rem;
      color: var(--text-secondary);
      text-decoration: none;
      background: none;
      border: none;
      padding: 0;
      cursor: pointer;
      text-align: left;
      transition: color var(--transition-fast);
      display: inline;
    }
    .col-links a:hover,
    .footer-link-btn:hover {
      color: var(--accent-primary);
    }
    .footer-middle-bar {
      display: flex;
      justify-content: space-between;
      align-items: center;
      flex-wrap: wrap;
      gap: 1.5rem;
      padding: 1.75rem 0;
      border-bottom: 1px solid var(--border-subtle);
    }
    .copy-text {
      font-size: 0.825rem;
      color: var(--text-muted);
      margin: 0;
    }
    .social-links-row {
      display: flex;
      align-items: center;
      gap: 0.65rem;
    }
    .social-icon-btn {
      width: 44px;
      height: 44px;
      min-width: 44px;
      min-height: 44px;
      border-radius: var(--radius-sm);
      background: var(--bg-card);
      border: 1px solid var(--border-card);
      color: var(--text-secondary);
      display: flex;
      align-items: center;
      justify-content: center;
      transition: all var(--transition-fast);
      text-decoration: none;
    }
    .social-icon-btn:hover {
      background: var(--accent-primary-subtle);
      border-color: var(--border-hover);
      color: var(--accent-primary);
      transform: translateY(-2px);
    }

    /* Portfolio & Architecture Showcase Bar */
    .portfolio-engineering-bar {
      margin-top: 1.75rem;
      padding: 1.25rem 1.5rem;
      border-radius: var(--radius-lg);
      background: var(--bg-card);
      border: 1px solid var(--border-card);
      display: flex;
      flex-direction: column;
      gap: 0.85rem;
    }
    .portfolio-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      flex-wrap: wrap;
      gap: 0.5rem;
    }
    .portfolio-tag {
      font-size: 0.725rem;
      font-weight: 800;
      letter-spacing: 0.08em;
      color: var(--accent-primary);
      font-family: var(--font-mono);
    }
    .portfolio-note {
      font-size: 0.775rem;
      color: var(--text-muted);
    }
    .portfolio-pills {
      display: flex;
      flex-wrap: wrap;
      gap: 0.45rem;
    }
    .tech-pill {
      font-size: 0.725rem;
      font-family: var(--font-mono);
      font-weight: 600;
      padding: 0.25rem 0.65rem;
      border-radius: var(--radius-sm);
      background: var(--bg-surface);
      border: 1px solid var(--border-subtle);
      color: var(--text-secondary);
      white-space: nowrap;
    }
    .portfolio-links {
      display: flex;
      align-items: center;
      flex-wrap: wrap;
      gap: 0.75rem;
      padding-top: 0.5rem;
      border-top: 1px dashed var(--border-subtle);
      font-size: 0.8rem;
    }
    .dev-link {
      display: inline-flex;
      align-items: center;
      gap: 0.35rem;
      color: var(--text-secondary);
      text-decoration: none;
      font-weight: 500;
      transition: color var(--transition-fast);
      min-height: 44px;
    }
    .dev-link:hover {
      color: var(--accent-primary);
    }
    .sep {
      color: var(--border-card);
    }

    /* Document Modal Styles */
    .modal-backdrop {
      position: fixed;
      inset: 0;
      background: rgba(0, 0, 0, 0.72);
      backdrop-filter: blur(10px);
      -webkit-backdrop-filter: blur(10px);
      z-index: 999;
      display: flex;
      align-items: center;
      justify-content: center;
      padding: 1.5rem;
      animation: fadeIn 0.2s ease-out;
    }
    .doc-modal {
      max-width: 680px;
      width: 100%;
      max-height: 85vh;
      display: flex;
      flex-direction: column;
      overflow: hidden;
      padding: 0;
      background: var(--bg-card);
      border: 1px solid var(--border-card);
      border-radius: var(--radius-xl);
      box-shadow: 0 25px 60px -15px rgba(0, 0, 0, 0.7);
      animation: modalSlide 0.25s cubic-bezier(0.16, 1, 0.3, 1);
    }
    .doc-modal-header {
      padding: 1.75rem 2rem 1.25rem;
      border-bottom: 1px solid var(--border-subtle);
      display: flex;
      justify-content: space-between;
      align-items: flex-start;
      gap: 1rem;
      background: var(--bg-surface);
      flex-shrink: 0;
    }
    .doc-header-left {
      display: flex;
      flex-direction: column;
    }
    .doc-badge {
      display: inline-block;
      font-size: 0.7rem;
      font-family: var(--font-mono);
      font-weight: 700;
      text-transform: uppercase;
      letter-spacing: 0.08em;
      color: var(--accent-primary);
      margin-bottom: 0.35rem;
    }
    .doc-title {
      font-size: 1.35rem;
      font-weight: 800;
      color: var(--text-primary);
      letter-spacing: -0.02em;
      line-height: 1.2;
    }
    .doc-subtitle {
      font-size: 0.85rem;
      color: var(--text-secondary);
      margin-top: 0.25rem;
    }
    .close-btn {
      width: 36px;
      height: 36px;
      border-radius: var(--radius-full);
      background: var(--bg-card);
      border: 1px solid var(--border-subtle);
      color: var(--text-muted);
      display: flex;
      align-items: center;
      justify-content: center;
      cursor: pointer;
      transition: all var(--transition-fast);
      flex-shrink: 0;
    }
    .close-btn:hover {
      background: var(--accent-primary-subtle);
      color: var(--accent-primary);
      border-color: var(--accent-primary);
    }
    .doc-body {
      padding: 1.75rem 2rem;
      overflow-y: auto;
      display: flex;
      flex-direction: column;
      gap: 1.35rem;
      font-size: 0.925rem;
      line-height: 1.65;
      color: var(--text-secondary);
      flex: 1;
    }
    .doc-section h3 {
      font-size: 1.05rem;
      font-weight: 700;
      color: var(--text-primary);
      margin-bottom: 0.45rem;
      letter-spacing: -0.01em;
    }
    .doc-section p {
      margin: 0;
    }
    .doc-section a {
      color: var(--accent-primary);
      text-decoration: underline;
    }
    .doc-list {
      margin: 0.5rem 0 0 1.25rem;
      display: flex;
      flex-direction: column;
      gap: 0.4rem;
    }
    .doc-list li strong {
      color: var(--text-primary);
    }
    .doc-list code {
      font-family: var(--font-mono);
      background: var(--bg-surface);
      padding: 0.15rem 0.4rem;
      border-radius: var(--radius-sm);
      font-size: 0.85em;
      color: var(--accent-primary);
    }
    .doc-modal-footer {
      padding: 1.15rem 2rem;
      border-top: 1px solid var(--border-subtle);
      display: flex;
      justify-content: space-between;
      align-items: center;
      background: var(--bg-surface);
      flex-shrink: 0;
    }
    .doc-footer-note {
      font-size: 0.775rem;
      color: var(--text-muted);
      font-family: var(--font-mono);
    }

    @keyframes fadeIn {
      from { opacity: 0; }
      to { opacity: 1; }
    }
    @keyframes modalSlide {
      from { transform: translateY(12px) scale(0.98); opacity: 0; }
      to { transform: translateY(0) scale(1); opacity: 1; }
    }

    @media (max-width: 1024px) {
      .footer-grid {
        grid-template-columns: 1fr 1fr;
        gap: 2.5rem 2rem;
      }
      .footer-brand-col {
        grid-column: 1 / -1;
      }
    }
    @media (max-width: 600px) {
      .footer-grid {
        grid-template-columns: 1fr 1fr;
        gap: 2rem 1.25rem;
      }
      .footer-brand-col {
        grid-column: 1 / -1;
      }
      .footer-middle-bar {
        flex-direction: column;
        align-items: flex-start;
      }
      .portfolio-engineering-bar {
        padding: 1rem;
      }
      .portfolio-pills {
        display: flex;
        flex-wrap: wrap;
        gap: 0.35rem;
      }
      .tech-pill {
        font-size: 0.68rem;
        padding: 0.2rem 0.45rem;
        display: inline-flex;
        align-items: center;
      }
      .portfolio-links {
        flex-direction: column;
        align-items: flex-start;
        gap: 0.5rem;
      }
      .portfolio-links .sep {
        display: none;
      }
      .doc-modal {
        width: 95%;
        max-height: 90vh;
      }
      .doc-modal-header {
        padding: 1.25rem 1.25rem 1rem;
      }
      .doc-body {
        padding: 1.25rem;
      }
      .doc-modal-footer {
        padding: 1rem 1.25rem;
      }
      .doc-footer-note {
        display: none;
      }
    }
  `]
})
export class FooterComponent {
  public newsletterEmail = '';
  public readonly isSubscribed = signal<boolean>(false);
  public readonly activeDoc = signal<string | null>(null);

  openDoc(type: string): void {
    this.activeDoc.set(type);
  }

  closeDoc(): void {
    this.activeDoc.set(null);
  }

  getDocBadge(type: string): string {
    const badges: Record<string, string> = {
      about: 'Platform Mission · Orbit Addis',
      privacy: 'Candidate Data Rights & Encryption',
      terms: 'Fair Pay & Employer Code of Conduct',
      security: 'Verification Standards & Auth Specs',
      salary: '2026 Compensation Index',
      contact: 'Direct Support & Headquarters',
      architecture: 'Clean Architecture .NET 10 & Angular 22'
    };
    return badges[type] || 'Platform Document';
  }

  getDocTitle(type: string): string {
    const titles: Record<string, string> = {
      about: 'About CareerOrbit',
      privacy: 'Privacy Policy & Data Protection',
      terms: 'Terms of Service',
      security: 'Security & Verification Standards',
      salary: 'Salary Transparency Guide (2026)',
      contact: 'Contact Support & Onboarding',
      architecture: 'Full-Stack Architecture Specification'
    };
    return titles[type] || 'Document';
  }

  getDocSubtitle(type: string): string {
    const subs: Record<string, string> = {
      about: 'Next-Gen Engineering & Tech Talent Platform · Addis Ababa, Ethiopia',
      privacy: 'Candidate confidentiality, encrypted resumes, zero third-party brokers',
      terms: 'Mandatory upfront compensation, fair hiring practices, candidate safeguards',
      security: 'Commercial entity vetting, cryptographic JWT auth, enterprise auditing',
      salary: 'Verified ETB (monthly) and USD (annual) tech compensation benchmarks',
      contact: 'Addis Ababa headquarters desk, partner support, and office address',
      architecture: 'ASP.NET Core 10 LTS Minimal APIs, PostgreSQL 18 & Angular 22 Signals'
    };
    return subs[type] || '';
  }

  onSubscribe(event: Event): void {
    event.preventDefault();
    if (this.newsletterEmail.trim()) {
      this.isSubscribed.set(true);
      setTimeout(() => {
        this.newsletterEmail = '';
      }, 2000);
    }
  }
}
