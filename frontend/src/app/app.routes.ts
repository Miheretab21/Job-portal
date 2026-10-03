import { Routes } from '@angular/router';

import { Home } from './pages/home/home';
import { Jobs } from './pages/jobs/jobs';
import { JobDetails } from './pages/job-details/job-details';
import { CreateJob } from './pages/create-job/create-job';
import { EditJob } from './pages/edit-job/edit-job';

export const routes: Routes = [
  {
    path: '',
    title: 'Home',
    component: Home,
  },
  {
    path: 'jobs',
    title: 'Jobs',
    component: Jobs,
  },
  {
    path: 'jobs/:id',
    title: 'Job Details',
    component: JobDetails,
  },
  {
    path: 'create-job',
    title: 'Create Job',
    component: CreateJob,
  },
  {
    path: 'edit-job/:id',
    title: 'Edit Job',
    component: EditJob,
  },
];