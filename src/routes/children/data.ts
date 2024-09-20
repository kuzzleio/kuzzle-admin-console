import IndexesPage from "@/components/Data/Indexes/Page.vue";
import CollectionList from "@/components/Data/Collections/CollectionList.vue";
import CollectionsCreate from "@/components/Data/Collections/Create.vue";
import CollectionsWatch from "@/components/Data/Collections/Watch.vue";
import CollectionsUpdate from "@/components/Data/Collections/Update.vue";
import DocumentsPage from "@/components/Data/Documents/Page.vue";
import DocumentsCreate from "@/components/Data/Documents/Create.vue";
import DocumentsUpdate from "@/components/Data/Documents/Update.vue";

export default [
  // Indexes routes
  {
    path: '/data',
    name: 'Indexes',
    component: IndexesPage,
  },
  {
    path: '/data/:indexName',
    name: 'Collections',
    meta: {
      auth: true
    },
    component: CollectionList,
    props: route => ({
      indexName: route.params.indexName
    })
  },
  {
    path: '/data/:indexName/create',
    name: 'CreateCollection',
    component: CollectionsCreate,
    props: route => ({
      indexName: route.params.indexName
    })
  },
  {
    path: '/data/:indexName/:collectionName/watch',
    name: 'WatchCollection',
    component: CollectionsWatch,
    props: route => ({
      indexName: route.params.indexName,
      collectionName: route.params.collectionName
    })
  },
  {
    path: '/data/:indexName/:collectionName/edit',
    name: 'EditCollection',
    component: CollectionsUpdate,
    props: route => ({
      indexName: route.params.indexName,
      collectionName: route.params.collectionName
    })
  },
  {
    path: '/data/:indexName/:collectionName',
    name: 'DocumentList',
    component: DocumentsPage,
    props: route => ({
      indexName: route.params.indexName,
      collectionName: route.params.collectionName
    })
  },
  {
    path: '/data/:indexName/:collectionName/create',
    name: 'CreateDocument',
    component: DocumentsCreate,
    props: route => ({
      indexName: route.params.indexName,
      collectionName: route.params.collectionName
    })
  },
  {
    path: '/data/:indexName/:collectionName/update/:id',
    name: 'UpdateDocument',
    component: DocumentsUpdate,
    props: route => ({
      id: route.params.id,
      indexName: route.params.indexName,
      collectionName: route.params.collectionName
    })
  }
]
