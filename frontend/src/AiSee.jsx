import { useState, useEffect } from "react";
import logo from './assets/logo.png'
import ahad from './assets/ahad.png'
import fahad from './assets/fahad.jpeg'
import miss from './assets/miss_majida.png'
import idaRieu from './assets/ida-rieu.png'

const NAV_LINKS = [
  { label: "Home",       href: "#"         },
  { label: "About",      href: "#about"    },
  { label: "Features",   href: "#features" },
  { label: "Working",    href: "#working"  },
  { label: "Contact Us", href: "#contact"  },
];
export default function AiSee() {
  const [toggled, setToggled] = useState(() => {
    return localStorage.getItem('darkMode') === 'true';
  });

  useEffect(() => {
    localStorage.setItem('darkMode', toggled);
  }, [toggled]);

  const WHY_ITEMS = [
    {
      icon: (
        <svg width="57" height="45" viewBox="0 0 57 45" fill="none" xmlns="http://www.w3.org/2000/svg">
          <g clip-path="url(#clip0_44_488)">
          <path d="M57 19.2857H53.8333V35.3571H57V45H47.5V41.7857H25.3333V45H15.8333V35.3571H19V32.1429H9.5V35.3571H0V25.7143H3.16667V9.64286H0V0H9.5V3.21429H31.6667V0H41.1667V9.64286H38V12.8571H47.5V9.64286H57V19.2857ZM50.6667 12.8571V16.0714H53.8333V12.8571H50.6667ZM34.8333 3.21429V6.42857H38V3.21429H34.8333ZM3.16667 3.21429V6.42857H6.33333V3.21429H3.16667ZM6.33333 32.1429V28.9286H3.16667V32.1429H6.33333ZM38 28.9286H34.8333V32.1429H38V28.9286ZM9.5 28.9286H31.6667V25.7143H34.8333V9.64286H31.6667V6.42857H9.5V9.64286H6.33333V25.7143H9.5V28.9286ZM22.1667 41.7857V38.5714H19V41.7857H22.1667ZM53.8333 41.7857V38.5714H50.6667V41.7857H53.8333ZM50.6667 35.3571V19.2857H47.5V16.0714H38V25.7143H41.1667V35.3571H31.6667V32.1429H22.1667V35.3571H25.3333V38.5714H47.5V35.3571H50.6667Z" fill={toggled ? 'black' : 'white'}/>
          </g>
          <defs>
          <clipPath id="clip0_44_488">
          <rect width="57" height="45" fill={toggled ? 'black' : 'white'}/>
          </clipPath>
          </defs>
        </svg>

      ),
      title: "Obstacle Detection",
      desc: "Instantly identifies objects, text, and faces using advanced computer vision algorithms built into the glasses.",
    },
    {
      icon: (
      <svg width="43" height="43" viewBox="0 0 43 43" fill="none" xmlns="http://www.w3.org/2000/svg">
          <path d="M8.95833 0C6.58244 0 4.30385 0.943822 2.62384 2.62384C0.943822 4.30385 0 6.58244 0 8.95833V34.0417C0 36.4176 0.943822 38.6962 2.62384 40.3762C4.30385 42.0562 6.58244 43 8.95833 43H34.0417C36.4176 43 38.6962 42.0562 40.3762 40.3762C42.0562 38.6962 43 36.4176 43 34.0417V8.95833C43 6.58244 42.0562 4.30385 40.3762 2.62384C38.6962 0.943822 36.4176 0 34.0417 0H8.95833ZM12.5417 10.75H30.4583C30.9335 10.75 31.3892 10.9388 31.7252 11.2748C32.0612 11.6108 32.25 12.0665 32.25 12.5417C32.25 13.0168 32.0612 13.4726 31.7252 13.8086C31.3892 14.1446 30.9335 14.3333 30.4583 14.3333H12.5417C12.0665 14.3333 11.6108 14.1446 11.2748 13.8086C10.9388 13.4726 10.75 13.0168 10.75 12.5417C10.75 12.0665 10.9388 11.6108 11.2748 11.2748C11.6108 10.9388 12.0665 10.75 12.5417 10.75ZM12.5417 19.7083H23.2917C23.7668 19.7083 24.2226 19.8971 24.5586 20.2331C24.8946 20.5691 25.0833 21.0248 25.0833 21.5C25.0833 21.9752 24.8946 22.4309 24.5586 22.7669C24.2226 23.1029 23.7668 23.2917 23.2917 23.2917H12.5417C12.0665 23.2917 11.6108 23.1029 11.2748 22.7669C10.9388 22.4309 10.75 21.9752 10.75 21.5C10.75 21.0248 10.9388 20.5691 11.2748 20.2331C11.6108 19.8971 12.0665 19.7083 12.5417 19.7083ZM12.5417 28.6667H30.4583C30.9335 28.6667 31.3892 28.8554 31.7252 29.1914C32.0612 29.5274 32.25 29.9832 32.25 30.4583C32.25 30.9335 32.0612 31.3892 31.7252 31.7252C31.3892 32.0612 30.9335 32.25 30.4583 32.25H12.5417C12.0665 32.25 11.6108 32.0612 11.2748 31.7252C10.9388 31.3892 10.75 30.9335 10.75 30.4583C10.75 29.9832 10.9388 29.5274 11.2748 29.1914C11.6108 28.8554 12.0665 28.6667 12.5417 28.6667Z" fill={toggled ? 'black' : 'white'}/>
        </svg>

      ),
      title: "Text Reader",
      desc: "The Raspberry Pi module processes video with powerful YOLO and OCR models for rapid, accurate responses.",
    },
    {
      icon: (
      <svg width="47" height="47" viewBox="0 0 47 47" fill="none" xmlns="http://www.w3.org/2000/svg">
      <path d="M15.6667 29.375C14.7528 29.375 13.9799 29.0591 13.348 28.4272C12.7161 27.7953 12.401 27.0233 12.4028 26.1111C12.4045 25.199 12.7205 24.4261 13.3506 23.7924C13.9808 23.1588 14.7528 22.8437 15.6667 22.8472C16.5805 22.8507 17.3534 23.1666 17.9853 23.7951C18.6172 24.4235 18.9323 25.1955 18.9305 26.1111C18.9288 27.0267 18.6129 27.7996 17.9827 28.4298C17.3526 29.0599 16.5805 29.375 15.6667 29.375ZM31.3333 29.375C30.4194 29.375 29.6465 29.0591 29.0147 28.4272C28.3828 27.7953 28.0677 27.0233 28.0694 26.1111C28.0712 25.199 28.3871 24.4261 29.0173 23.7924C29.6474 23.1588 30.4194 22.8437 31.3333 22.8472C32.2472 22.8507 33.0201 23.1666 33.652 23.7951C34.2839 24.4235 34.5989 25.1955 34.5972 26.1111C34.5955 27.0267 34.2795 27.7996 33.6494 28.4298C33.0192 29.0599 32.2472 29.375 31.3333 29.375ZM23.5 44.3889C29.3315 44.3889 34.2708 42.3653 38.318 38.318C42.3653 34.2708 44.3889 29.3315 44.3889 23.5C44.3889 22.4556 44.3236 21.4442 44.193 20.4659C44.0625 19.4876 43.8231 18.5406 43.475 17.625C42.5611 17.8426 41.6472 18.0062 40.7333 18.1159C39.8194 18.2256 38.862 18.2795 37.8611 18.2778C33.9009 18.2778 30.1583 17.4292 26.6333 15.7319C23.1083 14.0347 20.1055 11.663 17.625 8.61667C16.2324 12.0111 14.2419 14.9599 11.6534 17.4631C9.0649 19.9663 6.05081 21.848 2.61111 23.1083V23.5C2.61111 29.3315 4.63472 34.2708 8.68194 38.318C12.7292 42.3653 17.6685 44.3889 23.5 44.3889ZM23.5078 47C20.2579 47 17.2029 46.3838 14.3428 45.1513C11.4828 43.9171 8.9944 42.2434 6.87766 40.1302C4.76092 38.0169 3.08546 35.5303 1.85128 32.6702C0.617093 29.8102 0 26.7561 0 23.5078C0 20.2596 0.617093 17.2046 1.85128 14.3428C3.08546 11.4811 4.75744 8.99267 6.86722 6.87767C8.977 4.76267 11.4636 3.08721 14.3272 1.85128C17.1907 0.615356 20.2457 -0.00173707 23.4922 3.67245e-06C26.7386 0.00174441 29.7936 0.618837 32.6572 1.85128C35.5207 3.08373 38.0091 4.75658 40.1223 6.86984C42.2356 8.98309 43.911 11.4697 45.1487 14.3298C46.3864 17.1898 47.0035 20.2439 47 23.4922C46.9965 26.7404 46.3803 29.7954 45.1513 32.6572C43.9224 35.5189 42.2478 38.0073 40.1275 40.1223C38.0073 42.2373 35.5215 43.9128 32.6702 45.1487C29.8189 46.3846 26.7648 47.0017 23.5078 47Z" fill={toggled ? 'black' : 'white'}/>
      </svg>

      ),
      title: "People Recognition",
      desc: "Bone-conduction speaker delivers clear guidance privately without blocking your natural hearing.",
    },
  ];

const HOW_STEPS = [
    {
      step: "See",
      desc: "The tiny camera on the glasses captures the world",
      icon: (
      <svg width="50" height="76" viewBox="0 0 76 69" fill="none" xmlns="http://www.w3.org/2000/svg">
          <path d="M68.25 7.58333H56.2304L49.2917 0H26.5417L19.6029 7.58333H7.58333C3.4125 7.58333 0 10.9958 0 15.1667V60.6667C0 64.8375 3.4125 68.25 7.58333 68.25H68.25C72.4208 68.25 75.8333 64.8375 75.8333 60.6667V15.1667C75.8333 10.9958 72.4208 7.58333 68.25 7.58333ZM68.25 60.6667H7.58333V15.1667H22.9396L25.1767 12.7021L29.8783 7.58333H45.955L50.6567 12.7021L52.8937 15.1667H68.25V60.6667ZM37.9167 18.9583C27.4517 18.9583 18.9583 27.4517 18.9583 37.9167C18.9583 48.3817 27.4517 56.875 37.9167 56.875C48.3817 56.875 56.875 48.3817 56.875 37.9167C56.875 27.4517 48.3817 18.9583 37.9167 18.9583ZM37.9167 50.05C31.2054 50.05 25.7833 44.6279 25.7833 37.9167C25.7833 31.2054 31.2054 25.7833 37.9167 25.7833C44.6279 25.7833 50.05 31.2054 50.05 37.9167C50.05 44.6279 44.6279 50.05 37.9167 50.05Z" fill={toggled ? "black" : "white"}/>
        </svg>

      ),
    },
    {
      step: "Process",
      desc: "The Raspberry Pi in your pocket analyzes the video with powerful AI (YOLO, OCR).",
      icon: (
        <svg width="63" height="63" viewBox="0 0 93 93" fill="none" xmlns="http://www.w3.org/2000/svg">
        <g clip-path="url(#clip0_44_522)">
        <path d="M86.516 67.89C86.3343 67.2457 85.9095 66.697 85.3312 66.3597C84.7529 66.0224 84.0663 65.9227 83.416 66.0817L76.9835 67.8125C80.5034 62.6239 82.6377 56.6212 83.1835 50.375C83.7111 44.5313 82.8566 38.6453 80.6891 33.1928C78.5215 27.7403 75.1017 22.8741 70.706 18.9875C70.1978 18.5673 69.5482 18.3572 68.8902 18.4005C68.2322 18.4437 67.6156 18.7369 67.1668 19.22C66.7152 19.7342 66.4861 20.4065 66.5297 21.0894C66.5733 21.7723 66.886 22.41 67.3993 22.8626C71.1871 26.206 74.1339 30.3948 76.001 35.0894C77.8681 39.7841 78.6029 44.8526 78.146 49.8842C77.7024 55.1837 75.925 60.2848 72.9793 64.7125L72.3335 58.2284C72.3822 57.8468 72.345 57.4591 72.2248 57.0937C72.1045 56.7283 71.9041 56.3943 71.6383 56.1162C71.3725 55.8382 71.0479 55.623 70.6883 55.4863C70.3287 55.3497 69.9431 55.2952 69.5597 55.3266C69.1762 55.3581 68.8047 55.4748 68.4722 55.6682C68.1396 55.8616 67.8545 56.1268 67.6375 56.4445C67.4206 56.7622 67.2773 57.1244 67.2182 57.5045C67.1591 57.8846 67.1857 58.2732 67.296 58.6417L68.5876 75.2784L84.7335 70.99C85.373 70.803 85.9156 70.376 86.2478 69.7983C86.5799 69.2206 86.676 68.5369 86.516 67.89Z" fill={toggled ? "black" : "white"}/>
        <path d="M11.1343 44.1233C11.4792 44.3411 11.8669 44.4821 12.271 44.5367C12.9452 44.6251 13.6271 44.4442 14.1687 44.0331C14.7104 43.622 15.0681 43.014 15.1643 42.3408C16.2318 34.4595 20.2371 27.2723 26.3783 22.2185C32.5195 17.1647 40.3432 14.6174 48.2827 15.0867L42.496 19.0392C42.0866 19.3476 41.7782 19.7709 41.61 20.2552C41.4419 20.7394 41.4216 21.2628 41.5518 21.7586C41.682 22.2544 41.9567 22.7003 42.3411 23.0395C42.7254 23.3787 43.202 23.5958 43.7102 23.6633C44.2922 23.7166 44.875 23.5708 45.3635 23.25L59.1327 13.795L47.3527 1.96335C47.1431 1.64214 46.8645 1.37164 46.5373 1.17149C46.2101 0.971339 45.8425 0.846558 45.4611 0.806206C45.0796 0.765854 44.694 0.810944 44.3322 0.938203C43.9703 1.06546 43.6414 1.27169 43.3692 1.54193C43.097 1.81216 42.8884 2.13962 42.7585 2.50052C42.6287 2.86142 42.5808 3.24672 42.6184 3.62843C42.656 4.01014 42.7781 4.37868 42.9759 4.70732C43.1737 5.03595 43.4422 5.31641 43.7618 5.52835L48.1535 9.92001C38.9848 9.48161 29.9849 12.4965 22.9306 18.3696C15.8762 24.2427 11.28 32.5471 10.0493 41.6433C9.98311 42.1166 10.0495 42.599 10.241 43.0368C10.4326 43.4747 10.7418 43.8508 11.1343 44.1233Z" fill={toggled ? "black" : "white"}/>
        <path d="M56.1358 77.3192C52.1018 78.6077 47.8465 79.0561 43.6325 78.6367C38.5003 78.1336 33.5677 76.389 29.2605 73.5536C24.9532 70.7181 21.4008 66.8769 18.91 62.3617L25.3425 64.7642C25.9354 64.867 26.5457 64.7596 27.0679 64.4605C27.5901 64.1614 27.9915 63.6894 28.2028 63.1259C28.4141 62.5624 28.422 61.9428 28.2253 61.3741C28.0285 60.8054 27.6393 60.3232 27.125 60.0108L15.2675 55.6192L11.47 54.25L8.60245 70.6542C8.50304 71.3097 8.65947 71.9783 9.03936 72.5217C9.41924 73.0651 9.9935 73.4416 10.6433 73.5733H11.0825C11.6905 73.5844 12.2829 73.3806 12.7554 72.9978C13.228 72.6151 13.5503 72.0779 13.6658 71.4808L14.7508 65.2808C17.6726 70.3991 21.7766 74.7441 26.7201 77.9528C31.6635 81.1616 37.303 83.141 43.1675 83.7258C48.0705 84.2125 53.0213 83.6849 57.7116 82.1758C58.3089 81.9285 58.7917 81.4663 59.0648 80.8804C59.3379 80.2945 59.3814 79.6275 59.1867 79.0111C58.9921 78.3947 58.5734 77.8737 58.0133 77.5509C57.4533 77.2281 56.7926 77.127 56.1616 77.2675L56.1358 77.3192Z" fill={toggled ? "black" : "white"}/>
        <path d="M56.833 33.5834H36.1663C35.4812 33.5834 34.8241 33.8555 34.3396 34.34C33.8552 34.8245 33.583 35.4816 33.583 36.1667V56.8334C33.583 57.5185 33.8552 58.1756 34.3396 58.6601C34.8241 59.1445 35.4812 59.4167 36.1663 59.4167H56.833C57.5182 59.4167 58.1752 59.1445 58.6597 58.6601C59.1442 58.1756 59.4163 57.5185 59.4163 56.8334V36.1667C59.4163 35.4816 59.1442 34.8245 58.6597 34.34C58.1752 33.8555 57.5182 33.5834 56.833 33.5834ZM54.2497 54.25H38.7497V38.75H54.2497V54.25Z" fill={toggled ? "black" : "white"}/>
        </g>
        <defs>
        <clipPath id="clip0_44_522">
        <rect width="93" height="93" fill={toggled ? "black" : "white"}/>
        </clipPath>
        </defs>
        </svg>

      ),
    },
    {
      step: "Hear",
      desc: "Get a clear, spoken response through a discreet bone-conduction or in-ear speaker",
      icon: (
        <svg width="70" height="70" viewBox="0 0 107 107" fill="none" xmlns="http://www.w3.org/2000/svg">
        <path d="M53.5003 8.91663C57.0476 8.91663 60.4496 10.3258 62.9579 12.8341C65.4662 15.3424 66.8753 18.7444 66.8753 22.2916V49.0416C66.8753 52.5889 65.4662 55.9909 62.9579 58.4992C60.4496 61.0075 57.0476 62.4166 53.5003 62.4166C49.9531 62.4166 46.5511 61.0075 44.0428 58.4992C41.5345 55.9909 40.1253 52.5889 40.1253 49.0416V22.2916C40.1253 18.7444 41.5345 15.3424 44.0428 12.8341C46.5511 10.3258 49.9531 8.91663 53.5003 8.91663ZM84.7087 49.0416C84.7087 64.7795 73.0724 77.7533 57.9587 79.9379V93.625H49.042V79.9379C33.9282 77.7533 22.292 64.7795 22.292 49.0416H31.2087C31.2087 54.9537 33.5572 60.6237 37.7377 64.8042C41.9182 68.9847 47.5882 71.3333 53.5003 71.3333C59.4124 71.3333 65.0824 68.9847 69.2629 64.8042C73.4434 60.6237 75.792 54.9537 75.792 49.0416H84.7087Z" fill={toggled ? "black" : "white"}/>
        </svg>

      ),
    },
  ];

  const TEAM_ITEMS = [
    { name: "Fahad Rasheed", img: fahad },
    { name: "Abdul Ahad",   img: ahad },
    { name: "Laiba Mushtaq", img: "laiba.jpg" },
    { name: "Sehrish Ahmed", img: "sehrish.jpg" },
  ]

  return (
    <div className={`font-poppins min-h-screen ${toggled ? 'bg-black text-white' : 'bg-white text-gray-900'} `}>
      <section
        className="relative min-h-screen flex flex-col"
        style={{
          background: "linear-gradient(to bottom, #020505 0%, #0d0d0d 50%, #161616 100%)",
        }}
      >
        {/* Simulated starfield */}
        <div className="absolute inset-0 overflow-hidden pointer-events-none transition-all">
          {[...Array(400)].map((_, i) => (
            <div
              key={i}
              className="absolute rounded-full bg-white"
              style={{
                width: Math.random() > 0.8 ? "2px" : "1px",
                height: Math.random() > 0.8 ? "2px" : "1px",
                top: `${Math.random() * 100}%`,
                left: `${Math.random() * 100}%`,
                opacity: Math.random() * 0.6 + 0.1,
              }}
            />
          ))}
        </div>

        {/* NAV */}
        <nav className="relative z-10 flex items-center justify-between px-6 md:px-14 py-5">
         <ul className="flex gap-5 md:gap-10 text-white text-sm font-medium">
          {NAV_LINKS.map((l) => (
            <li key={l.label} className="cursor-pointer hover:text-gray-300 transition-colors hidden sm:block tracking-wide">
              <a href={l.href} onClick={(e) => {
                e.preventDefault();
                document.querySelector(l.href === "#" ? "body" : l.href)?.scrollIntoView({ behavior: "smooth" });
              }}>
                {l.label}
              </a>
            </li>
          ))}
          <li className="sm:hidden text-white font-bold text-lg">AiSee</li>
        </ul>
          {/* Dark/Light toggle */}
          <button
            onClick={() => setToggled((d) => !d)}
            className="relative cursor-pointer flex items-center w-16 h-8 rounded-full bg-white border border-gray-300 focus:outline-none transition-all"
            aria-label="Toggle theme"
          >
            {/* Sun icon (left) — renders above circle (z-30), white when circle overlaps, dark otherwise */}
            <span className={`absolute left-1 flex items-center justify-center w-6 h-6 z-30 pointer-events-none transition-colors duration-300 ${!toggled ? "text-white" : "text-gray-800"}`}>
              <svg viewBox="0 0 24 24" fill="none" className="w-3.5 h-3.5">
                <circle cx="12" cy="12" r="5" fill="currentColor" />
                <path d="M12 2v2M12 20v2M4.22 4.22l1.42 1.42M18.36 18.36l1.42 1.42M2 12h2M20 12h2M4.22 19.78l1.42-1.42M18.36 5.64l1.42-1.42" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
              </svg>
            </span>
            {/* Moon icon (right) — renders above circle (z-30), white when circle overlaps, dark otherwise */}
            <span className={`absolute right-1 flex items-center justify-center w-6 h-6 z-30 pointer-events-none transition-colors duration-300 ${toggled ? "text-white" : "text-gray-800"}`}>
              <svg viewBox="0 0 24 24" fill="currentColor" className="w-3.5 h-3.5">
                <path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z" />
              </svg>
            </span>
            {/* Sliding circle — black bg, z-20 so icons render on top of it */}
            <span
              className={`absolute top-1 w-6 h-6 rounded-full bg-black shadow-md transition-all duration-300 z-20 ${
                toggled ? "left-9" : "left-1"
              }`}
            />
          </button>
        </nav>

        {/* HERO CONTENT */}
        <div className="relative z-10 flex-1 flex flex-col items-center justify-center text-center px-6 pb-24">
          {/* <h1
            className="text-7xl md:text-9xl font-bold text-white mb-4"
            style={{ fontFamily: "'Georgia', 'Times New Roman', serif", letterSpacing: "-0.02em" }}
          >
            Ai<span className="text-white">See</span>
          </h1> */}
          <img src={logo} alt="" />
          <p className="text-gray-400 text-base md:text-lg italic tracking-widest">
            The vision of the future
          </p>
        </div>
      </section>

      {/* ── ABOUT ── */}
      <section id="about" className={` py-20 px-6 mt-16 `}>
        <div className="max-w-2xl mx-auto text-center">
          <h2 className={`text-3xl md:text-6xl font-bold mb-8 font-poppins-bold tracking-wider`}>About Our Product</h2>
          <p className=" leading-relaxed text-sm md:text-xl">
            Our product is a pair of smart glasses designed to augment human ability through seamless audio
            feedback. By integrating a discreet camera with a powerful Raspberry Pi brain, we transform visual
            information into an intuitive auditory stream. Whether it's identifying objects, reading text aloud,
            or recognizing faces, our goal is to provide a hands-free layer of understanding, promoting greater
            independence and interaction with the world. This is intelligent assistance, designed for real life.
          </p>
        </div>
      </section>

      {/* ── WHY BUY ── */}
      <section id="features" className={`${toggled ? 'bg-black text-white' : 'bg-white text-gray-800'} py-16 px-6`}>
        <div className="max-w-4xl mx-auto text-center">
          <h2 className="text-3xl md:text-6xl font-bold mb-14 font-poppins-bold tracking-wider">Why Buy AiSee?</h2>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-45 mt-20">
            {WHY_ITEMS.map((item) => (
              <div key={item.title} className="flex flex-col items-center gap-5 cursor-pointer">
                <div className={`w-32 h-32 rounded-full ${!toggled ? 'bg-black text-white' : 'bg-white text-gray-800'} flex items-center justify-center shrink-0`}>
                  {item.icon}
                </div>
                <h2 className="text-xl md:text-xl font-bold mb-4 tracking-wider font-poppins-light whitespace-nowrap">{item.title}</h2>
                <p className="text-xs md:text-lg leading-relaxed">{item.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── HOW IT WORKS ── */}
      <section id="working" className={`${toggled ? 'bg-black text-white' : 'bg-white text-gray-900'} py-16 px-6`}>
        <div className="max-w-md mx-auto">
          <h2 className="text-3xl md:text-6xl font-bold mb-14 text-center font-poppins-bold tracking-wider">How It Works</h2>
          <div className="flex flex-col gap-10">
            {HOW_STEPS.map((s) => (
              <div key={s.step} className="flex items-start gap-5">
                <div
                  className={`shrink-0 w-32 h-32 rounded-full border-2 ${!toggled ? 'bg-black text-white' : 'bg-white text-gray-900'} border-gray-900 flex items-center justify-center`}
                >
                  {s.icon}
                </div>
                <div className="pt-2">
                  <h3 className="font-bold text-xl mb-1 tracking-wider">{s.step}</h3>
                  <p className="text-md leading-relaxed">{s.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── MEET THE TEAM ── */}
      <section className={`${toggled ? 'bg-black text-white' : 'bg-white text-gray-900'} py-16 px-6`}>
        <div className="max-w-3xl mx-auto">
          <h2 className="text-3xl md:text-6xl font-bold mb-10 text-center font-poppins-bold tracking-wider">Meet the Team</h2>
          <div className="flex justify-center items-center flex-wrap md:flex-nowrap gap-20 mt-20 md:gap-20 justify-items-center">
            {TEAM_ITEMS.map((member) => (
              <div key={member.name} className="flex flex-col items-center gap-3">
                <div className={`w-44 h-44 md:w-64 md:h-64 rounded-full overflow-hidden border-4 cursor-pointer ${toggled ? 'border-white' : 'border-gray-400'} bg-gray-200 hover:border-gray-500 transition-all`}>
                  <img
                    src={member.img}
                    alt={member.name}
                    className="w-full h-full object-cover"
                    onError={(e) => { e.target.style.display = 'none'; }}
                  />
                </div>
                <p className="text-lg font-poppins-semibold text-center tracking-wide">{member.name}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

        {/* ── SUPERVISED BY ── */}
        <section className={`${toggled ? 'bg-black text-white' : 'bg-white text-gray-900'} py-16 px-6`}>
          <div className="max-w-3xl mx-auto text-center">
            <h2 className="text-3xl md:text-6xl font-bold mb-14 font-poppins-bold  tracking-wider">Supervised By</h2>
            <div className="flex flex-col items-center gap-3">
              <div className={`w-64 h-64 rounded-full overflow-hidden border-4 ${toggled ? 'border-white' : 'border-gray-300'} bg-gray-200 hover:border-gray-500 cursor-pointer`}>
                <img
                  src={miss}
                  alt="Dr. Majida Kazmi"
                  className="w-full h-full object-cover"
                  onError={(e) => { e.target.style.display = 'none'; }}
                />
              </div>
              <p className="text-lg font-poppins-semibold tracking-wide">Dr. Majida Kazmi</p>
            </div>
          </div>
        </section>

        {/* ── IN COLLABORATION WITH ── */}
        <section className={`${toggled ? 'bg-black text-white' : 'bg-white text-gray-900'} py-16 px-6`}>
          <div className="max-w-3xl mx-auto text-center">
            <h2 className="text-3xl md:text-6xl font-bold mb-14 font-poppins-bold tracking-wider">In Collaboration With</h2>
            <div className="flex flex-col items-center gap-3">
              <div className={`w-full  overflow-hidden rounded-lg border-4 ${toggled ? 'border-white' : 'border-gray-300'} hover:border-gray-500 cursor-pointer`}>
                <img
                  src={idaRieu}
                  alt="Ida Rieu School For Blind And Deaf"
                  className=""
                  onError={(e) => { e.target.style.display = 'none'; }}
                />
              </div>
              <p className="text-lg font-poppins-semibold tracking-wide mt-1">Ida Rieu School For Blind And Deaf</p>
            </div>
          </div>
        </section>


     {/* ── FOOTER ── */}
    <footer id="contact" className="bg-black text-white pb-10 pt-20 px-6">
      <div className="max-w-5xl mx-auto flex flex-col items-center gap-6">

        {/* Contact Us */}
        <div className="flex flex-col items-center gap-3 w-full">
          <p className="font-poppins-light text-sm tracking-[0.3em] text-gray-400 uppercase">Contact Us</p>
          <a
            href="mailto:ai-see@gmail.com"
            className="text-3xl md:text-7xl font-bold underline decoration-blue-500 underline-offset-8 hover:text-blue-400 transition-colors tracking-wider"
          >
            ai-see@gmail.com
          </a>
        </div>

        {/* Divider */}
        <div className="w-full border-t border-gray-700 mt-4" />

        {/* Social Links */}
        <div className="flex flex-wrap justify-center gap-4 mt-2">
          {/* Instagram */}
          <a
            href="#"
            className="group flex items-center gap-2 px-5 py-2.5 rounded-full border border-gray-600 text-xs tracking-widest uppercase hover:border-white transition-colors hover:bg-white hover:text-black"
          >
            <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor" xmlns="http://www.w3.org/2000/svg">
              <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zM12 0C8.741 0 8.333.014 7.053.072 2.695.272.273 2.69.073 7.052.014 8.333 0 8.741 0 12c0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98C8.333 23.986 8.741 24 12 24c3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98C15.668.014 15.259 0 12 0zm0 5.838a6.162 6.162 0 1 0 0 12.324 6.162 6.162 0 0 0 0-12.324zM12 16a4 4 0 1 1 0-8 4 4 0 0 1 0 8zm6.406-11.845a1.44 1.44 0 1 0 0 2.881 1.44 1.44 0 0 0 0-2.881z"/>
            </svg>
            Instagram
          </a>

          {/* LinkedIn */}
          <a
            href="#"
            className="group flex items-center gap-2 px-5 py-2.5 rounded-full border border-gray-600 text-xs tracking-widest uppercase hover:border-white transition-colors hover:bg-white hover:text-black"
          >
            <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor" xmlns="http://www.w3.org/2000/svg">
              <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433a2.062 2.062 0 0 1-2.063-2.065 2.064 2.064 0 1 1 2.063 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z"/>
            </svg>
            LinkedIn
          </a>

          {/* WhatsApp */}
          <a
            href="#"
            className="group flex items-center gap-2 px-5 py-2.5 rounded-full border border-gray-600 text-xs tracking-widest uppercase hover:border-white transition-colors hover:bg-white hover:text-black"
          >
            <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor" xmlns="http://www.w3.org/2000/svg">
              <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 0 1-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 0 1-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 0 1 2.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0 0 12.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 0 0 5.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 0 0-3.48-8.413z"/>
            </svg>
            WhatsApp
          </a>
        </div>

        {/* Copyright */}
        <p className="text-gray-600 text-xs tracking-wide mt-2">
          © {new Date().getFullYear()} AiSee — The vision of the future
        </p>

      </div>
    </footer>
    </div>
  );
}