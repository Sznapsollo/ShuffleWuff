

const routes = [
    { path: '/ShuffleWuff/dictionary', name: 'dictionary', component: Dictionary },
    { path: '/ShuffleWuff/about', name: 'about', component: About },
    { path: '/ShuffleWuff/', name: 'shuffle', component: Shuffle }
  ];
  
const router = VueRouter.createRouter({
    history: VueRouter.createWebHistory(),
    // base: '/ShuffleWuff/',
	routes,
});

app.use(router)