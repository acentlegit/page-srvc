import React from 'react';
import { useParams } from 'react-router-dom';
import WebsiteCustomizationProjectsPage from '../applicationCustomization/ProjectsPage';

export default function CitizenServicesProjectsPage() {
  const { id } = useParams();
  // Pass citizen-services-1 as the customApplicationId
  return <WebsiteCustomizationProjectsPage customApplicationId="citizen-services-1" />;
}
