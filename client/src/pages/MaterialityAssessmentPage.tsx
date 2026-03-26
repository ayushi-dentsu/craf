import { useMutation, useQuery } from '@tanstack/react-query';
import { MaterialityPage } from '../components/materiality/MaterialityPage';
import { getMateriality, saveMateriality, getSignificantAccounts } from '../services/materiality.service';

export function MaterialityAssessmentPage() {
  const { data: materialityData, isLoading } = useQuery({
    queryKey: ['materiality'],
    queryFn: () => getMateriality(),
  });

  const { data: accountsData } = useQuery({
    queryKey: ['materiality', 'significant-accounts'],
    queryFn: () => getSignificantAccounts(),
  });

  const saveMutation = useMutation({ mutationFn: saveMateriality });

  if (isLoading) {
    return (
      <div className="flex h-64 items-center justify-center">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent" role="status">
          <span className="sr-only">Loading…</span>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-5">
      <h1 className="text-xl font-semibold text-foreground">Materiality Assessment</h1>
      <MaterialityPage
        data={materialityData as Parameters<typeof MaterialityPage>[0]['data']}
        significantAccounts={(accountsData as Parameters<typeof MaterialityPage>[0]['significantAccounts']) ?? []}
        onSave={(values) => saveMutation.mutate(values)}
        isSaving={saveMutation.isPending}
      />
    </div>
  );
}
