// ==========================================================================
// CA ANIT ACHANKUNJU & CO. - INTERACTIVE WEBSITE LOGIC
// Dynamic utilities, tax estimator, split service showcase, modals, filters
// ==========================================================================

document.addEventListener('DOMContentLoaded', () => {
    initThemeToggle();
    initMobileNav();
    initTaxCalculator();
    initServiceFilters();
    initSplitServiceShowcase();
    initDueDatesFilter();
    initFaqAccordion();
    initConsultationForm();
    initScrollSpy();
    initCounters();
    updateYear();
});

// 1. Theme Switcher (Light / Dark Mode with ca-agarwal style defaults)
function initThemeToggle() {
    const themeBtn = document.getElementById('themeToggleBtn');
    if (!themeBtn) return;
    const themeText = document.getElementById('themeText');
    const themeIcon = themeBtn.querySelector('i');
    
    // Check local storage or default to light theme (clean corporate style like ca-agarwal)
    const savedTheme = localStorage.getItem('ca_theme') || 'light';
    document.documentElement.setAttribute('data-theme', savedTheme);
    updateThemeUI(savedTheme);

    themeBtn.addEventListener('click', () => {
        const currentTheme = document.documentElement.getAttribute('data-theme');
        const newTheme = currentTheme === 'dark' ? 'light' : 'dark';
        document.documentElement.setAttribute('data-theme', newTheme);
        localStorage.setItem('ca_theme', newTheme);
        updateThemeUI(newTheme);
        showToast(`Switched to ${newTheme === 'dark' ? 'Dark Luxury' : 'Corporate Light'} Theme`, 'info');
    });

    function updateThemeUI(theme) {
        if (theme === 'dark') {
            themeIcon.className = 'fa-solid fa-sun';
            themeText.textContent = 'Light Theme';
        } else {
            themeIcon.className = 'fa-solid fa-moon';
            themeText.textContent = 'Dark Theme';
        }
    }
}

// 2. Mobile Drawer Navigation & Backdrop Management
function initMobileNav() {
    const menuBtn = document.getElementById('mobileMenuBtn');
    const navMenu = document.getElementById('navMenu');
    const navBackdrop = document.getElementById('navBackdrop');
    const navCloseBtn = document.getElementById('navCloseBtn');
    if (!menuBtn || !navMenu) return;

    function openMenu() {
        navMenu.classList.add('active');
        if (navBackdrop) navBackdrop.classList.add('active');
        document.body.classList.add('nav-open');
        const icon = menuBtn.querySelector('i');
        if (icon) icon.className = 'fa-solid fa-xmark';
    }

    function closeMenu() {
        navMenu.classList.remove('active');
        if (navBackdrop) navBackdrop.classList.remove('active');
        document.body.classList.remove('nav-open');
        const icon = menuBtn.querySelector('i');
        if (icon) icon.className = 'fa-solid fa-bars';
    }

    menuBtn.addEventListener('click', (e) => {
        e.stopPropagation();
        if (navMenu.classList.contains('active')) {
            closeMenu();
        } else {
            openMenu();
        }
    });

    if (navCloseBtn) {
        navCloseBtn.addEventListener('click', closeMenu);
    }

    if (navBackdrop) {
        navBackdrop.addEventListener('click', closeMenu);
    }

    // Close on any menu link click
    document.querySelectorAll('.nav-link').forEach(link => {
        link.addEventListener('click', closeMenu);
    });

    // Close on Escape key
    document.addEventListener('keydown', (e) => {
        if (e.key === 'Escape' && navMenu.classList.contains('active')) {
            closeMenu();
        }
    });
}

// 3. Indian Income Tax Estimator (FY 2024-25 / AY 2025-26)
function initTaxCalculator() {
    const calcBtn = document.getElementById('calculateTaxBtn');
    if (!calcBtn) return;

    calcBtn.addEventListener('click', computeTax);

    // Initial calculation on load
    computeTax();

    function computeTax() {
        const grossIncome = parseFloat(document.getElementById('grossIncome').value) || 0;
        const sec80C = Math.min(parseFloat(document.getElementById('sec80C').value) || 0, 150000);
        const sec80D = parseFloat(document.getElementById('sec80D').value) || 0;
        const otherDeductions = parseFloat(document.getElementById('otherDeductions').value) || 0;

        // NEW REGIME CALCULATIONS (AY 2025-26)
        // Standard Deduction: Rs 75,000
        const newStdDeduction = 75000;
        const newTaxableIncome = Math.max(0, grossIncome - newStdDeduction);
        let newTaxBase = 0;

        if (newTaxableIncome <= 700000) {
            // Full rebate u/s 87A under New Regime if taxable income <= 7L (effectively 7.75L gross)
            newTaxBase = 0;
        } else {
            // Slabs:
            // 0 - 3L: 0%
            // 3L - 7L: 5% (max 20k)
            // 7L - 10L: 10% (max 30k)
            // 10L - 12L: 15% (max 30k)
            // 12L - 15L: 20% (max 60k)
            // > 15L: 30%
            let remaining = newTaxableIncome;
            if (remaining > 1500000) {
                newTaxBase += (remaining - 1500000) * 0.30;
                remaining = 1500000;
            }
            if (remaining > 1200000) {
                newTaxBase += (remaining - 1200000) * 0.20;
                remaining = 1200000;
            }
            if (remaining > 1000000) {
                newTaxBase += (remaining - 1000000) * 0.15;
                remaining = 1000000;
            }
            if (remaining > 700000) {
                newTaxBase += (remaining - 700000) * 0.10;
                remaining = 700000;
            }
            if (remaining > 300000) {
                newTaxBase += (remaining - 300000) * 0.05;
            }
        }
        const newTotalTax = Math.round(newTaxBase * 1.04); // 4% Health & Ed Cess

        // OLD REGIME CALCULATIONS
        const oldStdDeduction = 50000;
        const totalOldDeductions = oldStdDeduction + sec80C + sec80D + otherDeductions;
        const oldTaxableIncome = Math.max(0, grossIncome - totalOldDeductions);
        let oldTaxBase = 0;

        if (oldTaxableIncome <= 500000) {
            // Rebate u/s 87A
            oldTaxBase = 0;
        } else {
            // Old Slabs:
            // 0 - 2.5L: 0%
            // 2.5L - 5L: 5% (12.5k)
            // 5L - 10L: 20% (1L)
            // > 10L: 30%
            let remaining = oldTaxableIncome;
            if (remaining > 1000000) {
                oldTaxBase += (remaining - 1000000) * 0.30;
                remaining = 1000000;
            }
            if (remaining > 500000) {
                oldTaxBase += (remaining - 500000) * 0.20;
                remaining = 500000;
            }
            if (remaining > 250000) {
                oldTaxBase += (remaining - 250000) * 0.05;
            }
        }
        const oldTotalTax = Math.round(oldTaxBase * 1.04);

        // Update UI Elements
        document.getElementById('newRegimeTax').textContent = formatINR(newTotalTax);
        document.getElementById('newGrossVal').textContent = formatINR(grossIncome);
        document.getElementById('newTaxableVal').textContent = formatINR(newTaxableIncome);
        document.getElementById('newEffectiveRate').textContent = grossIncome > 0 ? ((newTotalTax / grossIncome) * 100).toFixed(1) + '%' : '0%';

        document.getElementById('oldRegimeTax').textContent = formatINR(oldTotalTax);
        document.getElementById('oldGrossVal').textContent = formatINR(grossIncome);
        document.getElementById('oldDeductionsVal').textContent = formatINR(totalOldDeductions);
        document.getElementById('oldTaxableVal').textContent = formatINR(oldTaxableIncome);
        document.getElementById('oldEffectiveRate').textContent = grossIncome > 0 ? ((oldTotalTax / grossIncome) * 100).toFixed(1) + '%' : '0%';

        // Recommendation logic
        const recBox = document.getElementById('recommendationText');
        const diff = Math.abs(newTotalTax - oldTotalTax);

        if (newTotalTax < oldTotalTax) {
            recBox.innerHTML = `<strong>New Tax Regime Saves You ${formatINR(diff)}!</strong> You benefit more from reduced slab rates under the New Regime.`;
        } else if (oldTotalTax < newTotalTax) {
            recBox.innerHTML = `<strong>Old Tax Regime Saves You ${formatINR(diff)}!</strong> Your total deductions (${formatINR(totalOldDeductions)}) lower your tax liability significantly.`;
        } else {
            recBox.innerHTML = `<strong>Both Regimes result in equal tax (${formatINR(newTotalTax)}).</strong> You can opt for either regime.`;
        }
    }
}

// 4. Split Service Showcase (Pure Vector & Icons - No Photos)
const splitShowcaseData = [
    {
        title: "Tax Planning, Advisory & Compliance",
        icon: "fa-scale-balanced",
        description: "Proactive tax planning enabling businesses and individuals to legally structure transactions, investments, and corporate entities for maximum statutory efficiency and full compliance.",
        highlights: [
            "Corporate restructuring for LLPs, Pvt Ltd & Startups",
            "Capital Gains & Real Estate transaction structuring",
            "Old vs New Tax Regime salary optimization for companies"
        ],
        ctaText: "Consult On Tax Planning"
    },
    {
        title: "Income Tax Litigation & Scrutiny Defense",
        icon: "fa-gavel",
        description: "Authoritative technical representation before Income Tax Assessing Officers, Faceless Assessment Centers, and CIT(Appeals). Comprehensive defense against notices issued under Sections 142(1), 143(2), 147, and 148.",
        highlights: [
            "Scrutiny & Reassessment notice response drafting",
            "Faceless assessment submissions & representation",
            "Penalty proceedings defense and rectification u/s 154"
        ],
        ctaText: "Review My Tax Notice"
    },
    {
        title: "Audit, Attestation, Certification & Due Diligence",
        icon: "fa-clipboard-check",
        description: "Independent audit of financial statements ensuring strict compliance with the Companies Act 2013 and Section 44AB Tax Audit requirements. Objective evaluation of internal financial controls.",
        highlights: [
            "Comprehensive Section 44AB Tax Audits & Form 3CD",
            "Statutory Company Audits & Independent Auditor Reports",
            "Internal Financial Controls (IFC) testing & risk matrix"
        ],
        ctaText: "Schedule Audit Engagement"
    },
    {
        title: "Virtual CFO & Management Office",
        icon: "fa-user-tie",
        description: "High-level strategic financial leadership for growing enterprises, funded startups, and mid-sized companies. End-to-end working capital oversight, budgeting, and boardroom reporting.",
        highlights: [
            "Strategic cash flow forecasting & working capital control",
            "Monthly Executive MIS decks and KPI benchmarking",
            "Financial feasibility models & investor presentation support"
        ],
        ctaText: "Engage Virtual CFO"
    },
    {
        title: "Remote Global Accounting & Bookkeeping",
        icon: "fa-globe",
        description: "Dedicated cross-border virtual accounting desk providing real-time bookkeeping, ledger maintenance, bank reconciliation, and audit support for entities across India, US, UK, UAE, and Singapore.",
        highlights: [
            "Seamless cloud software (QuickBooks, Xero, Zoho, Tally)",
            "Cross-border transaction & DTAA compliance support",
            "Strict data privacy, MFA protocols & NDA guarantees"
        ],
        ctaText: "Setup Remote Accounting"
    },
    {
        title: "Business Re-organizing & Restructuring",
        icon: "fa-sitemap",
        description: "Advising founders and corporate boards on entity restructuring, conversion of partnership firms to private limited companies, capital reduction, and regulatory compliance under corporate law.",
        highlights: [
            "LLP to Private Limited entity conversions",
            "Internal control diagnostic review & leak prevention",
            "Standard Operating Procedures (SOPs) for finance teams"
        ],
        ctaText: "Discuss Business Restructure"
    }
];

function initSplitServiceShowcase() {
    const tabs = document.querySelectorAll('.service-pill-tab');
    const spTitle = document.getElementById('spTitle');
    const spDesc = document.getElementById('spDesc');
    const spIcon = document.getElementById('spIcon');
    const spHighlights = document.getElementById('spHighlights');
    const spCta = document.getElementById('spCta');

    if (!tabs.length || !spTitle) return;

    tabs.forEach(tab => {
        tab.addEventListener('click', () => {
            tabs.forEach(t => t.classList.remove('active'));
            tab.classList.add('active');

            const idx = parseInt(tab.dataset.serviceIdx, 10);
            const data = splitShowcaseData[idx];
            if (!data) return;

            // Smoothly update showcase content
            spTitle.textContent = data.title;
            spDesc.textContent = data.description;
            if (spIcon && data.icon) {
                spIcon.className = `fa-solid ${data.icon}`;
            }

            spHighlights.innerHTML = data.highlights
                .map(h => `<li><i class="fa-solid fa-check-circle"></i> ${h}</li>`)
                .join('');

            spCta.innerHTML = `<i class="fa-solid fa-envelope"></i> ${data.ctaText}`;
            spCta.onclick = (e) => {
                prefillQuerySubject(data.title);
            };
        });
    });
}

// 5. Statutory Compliance Due Dates Filtering
function initDueDatesFilter() {
    const filterBtns = document.querySelectorAll('.due-filter-btn');
    const tableRows = document.querySelectorAll('#dueDatesTableBody tr');

    if (!filterBtns.length) return;

    filterBtns.forEach(btn => {
        btn.addEventListener('click', () => {
            filterBtns.forEach(b => b.classList.remove('active'));
            btn.classList.add('active');

            const filter = btn.dataset.dueFilter;

            tableRows.forEach(row => {
                const cat = row.dataset.cat;
                if (filter === 'all' || cat === filter) {
                    row.style.display = '';
                } else {
                    row.style.display = 'none';
                }
            });
        });
    });
}

// 6. Comprehensive Service Filtering & Detail Modals
const serviceData = [
    {
        title: "Income Tax Assessments & Litigation Support",
        category: "Taxation & Litigation",
        icon: "fa-gavel",
        description: "Navigating income tax notices and scrutiny assessments requires authoritative technical representation. CA Anit Achankunju brings deep litigation experience to protect client interests before Income Tax Authorities.",
        benefits: [
            "Expert analysis of Notices issued u/s 142(1), 143(2), 147, 148, and 156",
            "Formulation of legally grounded written replies and submissions",
            "Personal & Virtual appearances before Assessing Officers and CIT(Appeals)",
            "Stay of demand petitions and penalty waiver applications",
            "Rectifications of errors u/s 154 and refund processing resolution"
        ],
        deliverable: "Comprehensive legal defense, notice response documentation, and representation records."
    },
    {
        title: "Income Tax Audits & Tax Compliance",
        category: "Taxation & Litigation",
        icon: "fa-file-invoice-dollar",
        description: "Statutory tax compliance and audits u/s 44AB are executed with meticulous scrutiny to ensure zero regulatory penalties and complete alignment with ICAI auditing standards.",
        benefits: [
            "Preparation & Certification of Form 3CA/3CB and Form 3CD",
            "Quarterly TDS/TCS computation, return filing (24Q, 26Q, 27Q) and 16A generation",
            "Advance Tax calculations and installment optimization",
            "Filing of Annual Income Tax Returns (ITR-1 through ITR-7)",
            "Handling Transfer Pricing documentation & Form 3CEB for cross-border transactions"
        ],
        deliverable: "Certified Tax Audit Report (Form 3CD), filed ITR acknowledgments, and compliance certificates."
    },
    {
        title: "Statutory & Internal Audits",
        category: "Audit & Assurance",
        icon: "fa-clipboard-check",
        description: "Our audit practice provides objective assurance on financial reporting integrity, internal control framework, and statutory compliance for private companies, firms, and trusts.",
        benefits: [
            "Independent Statutory Audit under Companies Act, 2013",
            "Internal Financial Control (IFC) testing and risk matrix assessment",
            "Operational & Management Audits to identify process inefficiencies",
            "Inventory physical verification and stock audit certification",
            "Compliance audits for regulatory bodies and financial institutions"
        ],
        deliverable: "Independent Auditor's Report, Management Letter on internal control findings, and risk mitigation roadmap."
    },
    {
        title: "Accounting & Bookkeeping Services",
        category: "Advisory & Review",
        icon: "fa-book-journal-whills",
        description: "We provide robust, timely, and organized bookkeeping services tailored to startups, growing businesses, and established enterprises in Bangalore and beyond.",
        benefits: [
            "Regular ledger posting, day-book maintenance, and bank reconciliation",
            "Accounts Payable (AP) and Accounts Receivable (AR) management",
            "Implementation of standard accounting policies and chart of accounts",
            "Preparation of monthly Trial Balance, Profit & Loss, and Balance Sheet",
            "Software setup on Tally Prime, Zoho Books, QuickBooks, and Xero"
        ],
        deliverable: "Monthly financial statements, vendor reconciliation reports, and closed ledgers."
    },
    {
        title: "Tax Planning & Advisory",
        category: "Taxation & Litigation",
        icon: "fa-chart-line",
        description: "Proactive tax planning enables businesses and high-net-worth individuals to legally structure transactions, investments, and corporate entities for maximum tax efficiency.",
        benefits: [
            "Strategic corporate structuring for new business ventures & LLPs",
            "Capital Gains tax optimization on real estate, stocks, and business sales",
            "Remuneration planning for company directors & partners",
            "Tax-effective salary structure designing for executive teams",
            "Exemption and deduction optimization under Income Tax Act"
        ],
        deliverable: "Tailored Tax Planning Advisory Memorandum and tax projection models."
    },
    {
        title: "Financial & Management Advisory",
        category: "Advisory & Review",
        icon: "fa-chess-knight",
        description: "Beyond routine numbers, we serve as financial sounding boards to help founders and executive teams make data-driven strategic decisions.",
        benefits: [
            "Financial modeling, sensitivity analysis, and business valuation",
            "Cash flow forecasting and working capital optimization",
            "Feasibility studies and project finance pitch deck preparation",
            "Customized Management Information System (MIS) reports",
            "Cost reduction and profit margin enhancement analysis"
        ],
        deliverable: "Monthly Executive MIS Deck, Cash Flow Forecast Models, and Strategic Board Reports."
    },
    {
        title: "Business & Accounting Process Reviews",
        category: "Advisory & Review",
        icon: "fa-magnifying-glass-chart",
        description: "Comprehensive diagnostic reviews of your financial workflows, internal checks, and operational accounting setup to eliminate revenue leakage.",
        benefits: [
            "End-to-end review of current accounting workflows and internal controls",
            "Standard Operating Procedures (SOP) drafting for finance departments",
            "Fraud vulnerability assessment and segregation of duties check",
            "ERP transition advisory and data migration validation",
            "Vendor & customer credit policy evaluation"
        ],
        deliverable: "Diagnostic Process Review Report, Risk Matrix, and Actionable SOP Manual."
    },
    {
        title: "Virtual CFO & Remote Finance Support",
        category: "Virtual & Remote Support",
        icon: "fa-globe",
        description: "Our firm operates a dedicated virtual finance desk providing seamless accounting, audit support, and tax planning to domestic and international clients in US, UK, UAE, and SEA.",
        benefits: [
            "Dedicated Virtual CFO oversight without executive headcount costs",
            "Full-cycle remote bookkeeping on cloud platforms (Xero, QuickBooks, Zoho)",
            "Cross-border transaction accounting & double taxation (DTAA) advisory",
            "Audit support & workpaper preparation for foreign CPA firms",
            "Strict non-disclosure agreement (NDA) and multi-factor security protocols"
        ],
        deliverable: "Dedicated Virtual Desk SLAs, daily/weekly status reporting, and on-demand CA consultation."
    }
];

function initServiceFilters() {
    const tabBtns = document.querySelectorAll('.service-tabs .tab-btn');
    const serviceCards = document.querySelectorAll('.service-card');

    tabBtns.forEach(btn => {
        btn.addEventListener('click', () => {
            tabBtns.forEach(b => b.classList.remove('active'));
            btn.classList.add('active');

            const filter = btn.dataset.filter;

            serviceCards.forEach(card => {
                const category = card.dataset.category || '';
                const categories = category.split(' ');
                if (filter === 'all' || categories.includes(filter)) {
                    card.style.display = 'flex';
                } else {
                    card.style.display = 'none';
                }
            });
        });
    });
}

function openServiceModal(index) {
    const data = serviceData[index];
    if (!data) return;

    const modal = document.getElementById('serviceModal');
    const modalBody = document.getElementById('modalBody');

    const benefitsHTML = data.benefits.map(b => `<li><i class="fa-solid fa-check-circle"></i> ${b}</li>`).join('');

    modalBody.innerHTML = `
        <div class="modal-header-icon">
            <i class="fa-solid ${data.icon}"></i>
        </div>
        <span class="section-tag">${data.category}</span>
        <h2>${data.title}</h2>
        <p class="modal-body-desc">${data.description}</p>
        
        <div class="modal-list">
            <h4>Key Deliverables &amp; Scope:</h4>
            <ul>${benefitsHTML}</ul>
        </div>
        
        <div style="background:var(--maroon-subtle); padding:16px; margin-bottom:24px; border-radius:8px; border-left:3px solid var(--gold-primary);">
            <strong style="color:var(--maroon-primary); display:block; font-size:0.85rem;">PRIMARY DELIVERABLE:</strong>
            <span style="font-size:0.9rem; color:var(--text-body);">${data.deliverable}</span>
        </div>

        <div>
            <a href="#contact" onclick="closeServiceModal(); prefillQuerySubject('${data.title}');" class="btn btn-gold btn-block">
                Inquire About This Engagement <i class="fa-solid fa-paper-plane"></i>
            </a>
        </div>
    `;

    modal.classList.add('active');
    document.body.style.overflow = 'hidden';
}

function closeServiceModal() {
    const modal = document.getElementById('serviceModal');
    if (modal) {
        modal.classList.remove('active');
        document.body.style.overflow = 'auto';
    }
}

// 7. Modal Handlers for ca-agarwal Utility Features
function openTimesheetModal() {
    const modal = document.getElementById('timesheetModal');
    if (modal) {
        modal.classList.add('active');
        document.body.style.overflow = 'hidden';
    }
}

function closeTimesheetModal() {
    const modal = document.getElementById('timesheetModal');
    if (modal) {
        modal.classList.remove('active');
        document.body.style.overflow = 'auto';
    }
}

function openWhatsNewModal() {
    const modal = document.getElementById('whatsNewModal');
    if (modal) {
        modal.classList.add('active');
        document.body.style.overflow = 'hidden';
    }
}

function closeWhatsNewModal() {
    const modal = document.getElementById('whatsNewModal');
    if (modal) {
        modal.classList.remove('active');
        document.body.style.overflow = 'auto';
    }
}

// Global modal overlay outside-click close
window.addEventListener('click', (e) => {
    if (e.target.classList.contains('modal-overlay')) {
        closeServiceModal();
        closeTimesheetModal();
        closeWhatsNewModal();
    }
});

function prefillQuerySubject(subjectName) {
    const select = document.getElementById('serviceRequired');
    if (select) {
        let matched = false;
        for (let i = 0; i < select.options.length; i++) {
            if (select.options[i].text.includes(subjectName) || select.options[i].value.includes(subjectName)) {
                select.selectedIndex = i;
                matched = true;
                break;
            }
        }
        if (!matched && select.options.length > 0) {
            select.selectedIndex = 1; // Default to first active service option
        }
    }
    const contactSection = document.getElementById('contact');
    if (contactSection) {
        contactSection.scrollIntoView({ behavior: 'smooth' });
    }
}

// 8. FAQ Accordion & Live Search
function initFaqAccordion() {
    const faqItems = document.querySelectorAll('.faq-item');
    const searchInput = document.getElementById('faqSearchInput');

    faqItems.forEach(item => {
        const questionBtn = item.querySelector('.faq-question');
        questionBtn.addEventListener('click', () => {
            const isActive = item.classList.contains('active');
            faqItems.forEach(i => i.classList.remove('active'));
            if (!isActive) {
                item.classList.add('active');
            }
        });
    });

    if (searchInput) {
        searchInput.addEventListener('input', (e) => {
            const query = e.target.value.toLowerCase();
            faqItems.forEach(item => {
                const text = item.textContent.toLowerCase();
                if (text.includes(query)) {
                    item.style.display = 'block';
                } else {
                    item.style.display = 'none';
                }
            });
        });
    }
}

// 9. Consultation Form Handling
function initConsultationForm() {
    const form = document.getElementById('consultationForm');
    if (!form) return;

    form.addEventListener('submit', (e) => {
        e.preventDefault();

        const name = document.getElementById('clientName').value.trim();
        const email = document.getElementById('clientEmail').value.trim();
        const phone = document.getElementById('clientPhone').value.trim();
        const city = document.getElementById('clientCity')?.value.trim() || 'Bangalore';
        const service = document.getElementById('serviceRequired').value;
        const message = document.getElementById('clientMessage').value.trim();

        if (!name || !email || !phone || !service || !message) {
            showToast('Please fill in all required fields.', 'error');
            return;
        }

        // Generate Mailto Link as direct communication fallback
        const mailtoSubject = encodeURIComponent(`Client Inquiry (${service}) - ${name}`);
        const mailtoBody = encodeURIComponent(
            `Client Name: ${name}\n` +
            `Email: ${email}\n` +
            `Phone: ${phone}\n` +
            `Location / City: ${city}\n` +
            `Requested Service: ${service}\n\n` +
            `Inquiry Details:\n${message}\n\n` +
            `-- Sent via CA Anit Achankunju Official Website --`
        );

        showToast('Inquiry captured! Launching email to caanitco@gmail.com...', 'success');

        setTimeout(() => {
            window.location.href = `mailto:caanitco@gmail.com?subject=${mailtoSubject}&body=${mailtoBody}`;
            form.reset();
        }, 1200);
    });
}

// 10. ScrollSpy Active Nav Link
function initScrollSpy() {
    const sections = document.querySelectorAll('section[id]');
    const navLinks = document.querySelectorAll('.nav-link');

    window.addEventListener('scroll', () => {
        let current = '';
        const scrollY = window.scrollY;

        sections.forEach(section => {
            const sectionTop = section.offsetTop - 120;
            const sectionHeight = section.offsetHeight;
            if (scrollY >= sectionTop && scrollY < sectionTop + sectionHeight) {
                current = section.getAttribute('id');
            }
        });

        navLinks.forEach(link => {
            link.classList.remove('active');
            if (link.getAttribute('href') === `#${current}`) {
                link.classList.add('active');
            }
        });
    });
}

// 11. Animated Counters for Wireframe Stats Box
function initCounters() {
    const stats = document.querySelectorAll('.stat-wire-number[data-target]');
    let animated = false;

    window.addEventListener('scroll', () => {
        if (animated) return;
        const ribbon = document.querySelector('.stats-ribbon');
        if (!ribbon) return;

        const rect = ribbon.getBoundingClientRect();
        if (rect.top <= window.innerHeight && rect.bottom >= 0) {
            animated = true;
            stats.forEach(stat => {
                const target = parseFloat(stat.getAttribute('data-target'));
                let count = 0;
                const speed = 25;
                const increment = Math.max(1, Math.ceil(target / 25));

                const timer = setInterval(() => {
                    count += increment;
                    if (count >= target) {
                        stat.textContent = target + '+';
                        clearInterval(timer);
                    } else {
                        stat.textContent = count + '+';
                    }
                }, speed);
            });
        }
    });
}

// Helpers
function formatINR(amount) {
    return new Intl.NumberFormat('en-IN', {
        style: 'currency',
        currency: 'INR',
        maximumFractionDigits: 0
    }).format(amount);
}

function updateYear() {
    const yearEl = document.getElementById('currentYear');
    if (yearEl) yearEl.textContent = new Date().getFullYear();
}

function showToast(message, type = 'info') {
    const container = document.getElementById('toastContainer');
    if (!container) return;

    const toast = document.createElement('div');
    toast.className = `toast toast-${type}`;
    
    let iconClass = 'fa-circle-info';
    if (type === 'success') iconClass = 'fa-circle-check';
    if (type === 'error') iconClass = 'fa-circle-exclamation';

    toast.innerHTML = `<i class="fa-solid ${iconClass}" style="color:var(--gold-primary);"></i> <span>${message}</span>`;
    container.appendChild(toast);

    setTimeout(() => {
        toast.style.opacity = '0';
        toast.style.transform = 'translateX(100%)';
        setTimeout(() => toast.remove(), 300);
    }, 4000);
}
