const selector = document.querySelector("#root > div > div.min-h-screen.bg-gray-50 > main > div.space-y-8 > div:nth-child(1) > div.p-4.scale-in > div > div:nth-child(1) > div.bg-white.rounded-b-lg.scale-in > div > div.px-4.pb-4.subgroups-container > div > div.p-3.bg-gray-50.rounded-b-lg.border-t.scale-in > div > div > div > div > div.w-2\/3 > div > div"); const rect = selector ? selector.getBoundingClientRect() : null; const viewportWidth = window.innerWidth; if(rect) { console.log(`Расстояние от левого края элемента до правого края страницы: ${viewportWidth - rect.left}px`); }
