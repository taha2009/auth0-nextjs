'use client';

import SwaggerUI from 'swagger-ui-react';
import 'swagger-ui-react/swagger-ui.css';
import { spec } from '@/lib/openapi';

export default function DocsPage() {
  return (
    <div className="min-h-screen bg-white">
      <SwaggerUI
        spec={spec}
        persistAuthorization={true}
        tryItOutEnabled={true}
      />
    </div>
  );
}
