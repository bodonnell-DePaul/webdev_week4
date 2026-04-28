import { apiClient } from './client';

export async function getProjects() {
  const response = await apiClient.get('/projects');
  return response.data;
}

export async function getSummary() {
  const response = await apiClient.get('/summary');
  return response.data;
}

export async function createFeature(projectId, feature) {
  const response = await apiClient.post(`/projects/${projectId}/features`, feature);
  return response.data;
}

export async function updateFeatureStatus(featureId, status) {
  const response = await apiClient.patch(`/features/${featureId}/status`, { status });
  return response.data;
}

export async function createDecision(projectId, decision) {
  const response = await apiClient.post(`/projects/${projectId}/decisions`, decision);
  return response.data;
}