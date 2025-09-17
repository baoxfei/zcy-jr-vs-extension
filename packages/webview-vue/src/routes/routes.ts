import GenerateSnippet from '@/pages/GenerateSnippet/GenerateSnippet.vue'

const routes = [
  {
    path: '/',
    redirect: '/home',
  },
  {
    path: '/home',
    name: 'home',
    // component: () => import('@/pages/Home/Home.vue'),
    component: GenerateSnippet
  },
  {
    path: '/generateSnippet',
    name: 'generateSnippet',
    component: GenerateSnippet,
    // component: () => import('@/pages/GenerateSnippet/GenerateSnippet.vue'),
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