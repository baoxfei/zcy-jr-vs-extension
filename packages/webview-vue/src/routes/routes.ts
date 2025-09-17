const routes = [
  {
    path: '/',
    redirect: '/home',
  },
  {
    path: '/home',
    name: 'home',
    // component: () => import('@/pages/Home/Home.vue'),
    component: () => import('@/pages/GenerateSnippet/GenerateSnippet.vue')
  },
  {
    path: '/generateSnippet',
    name: 'generateSnippet',
    component: () => import('@/pages/GenerateSnippet/GenerateSnippet.vue'),
  },
  // {
  //   path: '/chat',
  //   name: 'chat',
  //   component: () => import('@/pages/Chat/Chat.vue'),
  // },
  // {
  //   path: '/404',
  //   name: '404',
  //   component: () => import('@/pages/404/404.vue'),
  // }
]

export default routes