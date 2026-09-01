// ==========================================================================
// CA ANIT ACHANKUNJU & CO. - INTERACTIVE WEBSITE LOGIC
// ==========================================================================

document.addEventListener('DOMContentLoaded', () => {
    initThemeToggle();
    initMobileNav();
    initTaxCalculator();
    initServiceFilters();
    initFaqAccordion();
    initConsultationForm();
    initScrollSpy();
    initCounters();
    updateYear();
});

// 1. Theme Switcher (Dark / Light Mode)
function initThemeToggle() {
    const themeBtn = document.getElementById('themeToggleBtn');
    const themeText = document.getElementById('themeText');
    const themeIcon = themeBtn.querySelector('i');
    
    // Check local storage or system preference
    const savedTheme = localStorage.getItem('ca_theme') || 'dark';
    document.documentElement.setAttribute('data-theme', savedTheme);
    updateThemeUI(savedTheme);

    themeBtn.addEventListener('click', () => {
        const currentTheme = document.documentElement.getAttribute('data-theme');
        const newTheme = currentTheme === 'dark' ? 'light' : 'dark';
        document.documentElement.setAttribute('data-theme', newTheme);
        localStorage.setItem('ca_theme', newTheme);
        updateThemeUI(newTheme);
        showToast(`Switched to ${newTheme === 'dark' ? 'Dark Executive' : 'Crisp Light'} Mode`, 'info');
    });

    function updateThemeUI(theme) {
        if (theme === 'dark') {
            themeIcon.className = 'fa-solid fa-moon';
            themeText.textContent = 'Dark Mode';
        } else {
            themeIcon.className = 'fa-solid fa-sun';
            themeText.textContent = 'Light Mode';
        }
    }
}

// 2. Mobile Menu Toggle
function initMobileNav() {
    const menuBtn = document.getElementById('mobileMenuBtn');
    const navMenu = document.getElementById('navMenu');
    
    menuBtn.addEventListener('click', () => {
        navMenu.classList.toggle('active');
        const isActive = navMenu.classList.contains('active');
        menuBtn.querySelector('i').className = isActive ? 'fa-solid fa-xmark' : 'fa-solid fa-bars';
    });

    // Close on menu link click
    document.querySelectorAll('.nav-link').forEach(link => {
        link.addEventListener('click', () => {
            navMenu.classList.remove('active');
            menuBtn.querySelector('i').className = 'fa-solid fa-bars';
        });
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

// 4. Service Filtering & Detail Modals
const serviceData = [
    {
        title: "Income Tax Assessments & Litigation Support",
        category: "Income Tax & Assessment",
        icon: "fa-gavel",
        description: "Navigating income tax notices and scrutiny assessments requires authoritative technical representation. CA Anit Achankunju brings deep litigation experience to protect client interests before Income Tax Authorities.",
        benefits: [
            "Expert analysis of Notices issued u/s 142(1), 143(2), 147, 148, and 156",
            "Formulation of legally grounded written replies and submissions",
            "Personal & Virtual appearances before Assessing Officers and CIT(Appeals)",
            "Stay of demand petitions and penalty waiver applications",
            "Rectifications of errors u/s 154 and refund processing resolution"
        ],
        deliverable: "Comprehensive legal defense, notice response documentation, and representation representation records."
    },
    {
        title: "Income Tax Audits & Tax Compliance",
        category: "Tax Compliance",
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
        category: "Accounting",
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
        category: "Tax Advisory",
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
        category: "Management Advisory",
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
        category: "Process Review",
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
        title: "Virtual Accounting & Remote Finance Support",
        category: "Remote & International",
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
                const category = card.dataset.category;
                if (filter === 'all' || category === filter) {
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
            <h4>Key Deliverables &amp; Benefits:</h4>
            <ul>${benefitsHTML}</ul>
        </div>
        
        <div class="modal-deliverable-box glass-card" style="padding:16px; margin-bottom:24px; border-left:3px solid var(--primary-gold);">
            <strong style="color:var(--primary-gold); display:block; font-size:0.85rem;">PRIMARY DELIVERABLE:</strong>
            <span style="font-size:0.9rem;">${data.deliverable}</span>
        </div>

        <div style="display:flex; gap:12px; flex-wrap:wrap;">
            <a href="#consultation" onclick="closeServiceModal(); selectServiceOption('${data.title}')" class="btn btn-primary btn-block">
                Inquire About This Service <i class="fa-solid fa-paper-plane"></i>
            </a>
        </div>
    `;

    modal.classList.add('active');
    document.body.style.overflow = 'hidden';
}

function closeServiceModal() {
    const modal = document.getElementById('serviceModal');
    modal.classList.remove('active');
    document.body.style.overflow = 'auto';
}

function selectServiceOption(serviceName) {
    const select = document.getElementById('serviceRequired');
    if (!select) return;
    
    for (let i = 0; i < select.options.length; i++) {
        if (select.options[i].text.includes(serviceName) || select.options[i].value.includes(serviceName)) {
            select.selectedIndex = i;
            break;
        }
    }
}

// Close modal when clicking outside card
document.getElementById('serviceModal')?.addEventListener('click', (e) => {
    if (e.target.id === 'serviceModal') {
        closeServiceModal();
    }
});

// 5. FAQ Accordion & Live Search
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

// 6. Consultation Form Handling
function initConsultationForm() {
    const form = document.getElementById('consultationForm');
    if (!form) return;

    form.addEventListener('submit', (e) => {
        e.preventDefault();

        const name = document.getElementById('clientName').value.trim();
        const email = document.getElementById('clientEmail').value.trim();
        const phone = document.getElementById('clientPhone').value.trim();
        const service = document.getElementById('serviceRequired').value;
        const message = document.getElementById('clientMessage').value.trim();

        if (!name || !email || !phone || !service || !message) {
            showToast('Please fill in all required fields.', 'error');
            return;
        }

        // Generate Mailto Link as fallback direct communication
        const mailtoSubject = encodeURIComponent(`New Client Inquiry: ${service} - ${name}`);
        const mailtoBody = encodeURIComponent(
            `Client Name: ${name}\n` +
            `Email: ${email}\n` +
            `Phone: ${phone}\n` +
            `Requested Service: ${service}\n\n` +
            `Message / Requirement:\n${message}\n\n` +
            `-- Sent via Website Consultation Portal --`
        );

        showToast('Inquiry captured! Launching email client for caanitco@gmail.com...', 'success');

        setTimeout(() => {
            window.location.href = `mailto:caanitco@gmail.com?subject=${mailtoSubject}&body=${mailtoBody}`;
            form.reset();
        }, 1200);
    });
}

// 7. ScrollSpy Active Nav Link
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

// 8. Animated Counters
function initCounters() {
    const stats = document.querySelectorAll('.stat-num[data-target]');
    let animated = false;

    window.addEventListener('scroll', () => {
        if (animated) return;
        const heroSection = document.getElementById('hero');
        if (!heroSection) return;

        const rect = heroSection.getBoundingClientRect();
        if (rect.top <= window.innerHeight && rect.bottom >= 0) {
            animated = true;
            stats.forEach(stat => {
                const target = parseFloat(stat.getAttribute('data-target'));
                let count = 0;
                const speed = 20;
                const increment = target / 30;

                const timer = setInterval(() => {
                    count += increment;
                    if (count >= target) {
                        stat.textContent = target % 1 === 0 ? target + '+' : target + '+';
                        clearInterval(timer);
                    } else {
                        stat.textContent = count.toFixed(target % 1 === 0 ? 0 : 1) + '+';
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

    toast.innerHTML = `<i class="fa-solid ${iconClass}" style="color:var(--primary-gold);"></i> <span>${message}</span>`;
    container.appendChild(toast);

    setTimeout(() => {
        toast.style.opacity = '0';
        toast.style.transform = 'translateX(100%)';
        setTimeout(() => toast.remove(), 300);
    }, 4000);
}
