'use client';

import { useState, useEffect } from 'react';
import DashboardLayout from '../components/DashboardLayout';
import { Card, Button } from '../components/ui';

interface Store {
  id: string;
  name: string;
  platform: 'takemypayments' | 'booker';
  outletId?: string;
  mid?: string;
  bookerId?: string;
  lastUploaded?: string;
  transactionCount?: number;
  isUploading?: boolean;
}

interface PayPalStatus {
  synced: boolean;
  transactionCount: number;
  lastSynced: string | null;
  syncedFrom: string | null;
  syncedTo: string | null;
}

const PREDEFINED_STORES: Store[] = [
  // TakeMyPayments Stores (10 total)
  { id: 'TPM194286-1', name: 'Cannon Street', platform: 'takemypayments', outletId: 'TPM194286-1', mid: 'GB0000000201388' },
  { id: 'TPM262523-2', name: 'Bath Road', platform: 'takemypayments', outletId: 'TPM262523-2', mid: 'GB0000000234497' },
  { id: 'TPM262523-3-1', name: 'Bracknell', platform: 'takemypayments', outletId: 'TPM262523-3', mid: 'GB0000000234494' },
  { id: 'TPM262523-3-2', name: 'Bishopsgate', platform: 'takemypayments', outletId: 'TPM262523-3', mid: 'GB0000000234498' },
  { id: 'TPM262523-4', name: 'Liverpool Street', platform: 'takemypayments', outletId: 'TPM262523-4', mid: 'GB0000000234498' },
  { id: 'TPM262523-5', name: 'Stockley Park', platform: 'takemypayments', outletId: 'TPM262523-5', mid: 'GB0000000234500' },
  { id: 'TPM262523-6', name: 'Waterside', platform: 'takemypayments', outletId: 'TPM262523-6', mid: 'GB0000000234499' },
  { id: 'GB0000000235518-1', name: 'Marlow', platform: 'takemypayments', mid: 'GB0000000235518' },
  { id: 'GB0000000235518-2', name: 'Ealing', platform: 'takemypayments', mid: 'GB0000000235518' },
  { id: 'GB0000000261813', name: 'Conductor/Westfield', platform: 'takemypayments', mid: 'GB0000000261813' },
  
  // Booker Stores
  { id: '742335034', name: 'Cannon Street', platform: 'booker', bookerId: '742335034' },
  { id: '741169011', name: 'Bath Road', platform: 'booker', bookerId: '741169011' },
  { id: '741169037', name: 'Bracknell', platform: 'booker', bookerId: '741169037' },
  { id: '742837716', name: 'Bishopsgate', platform: 'booker', bookerId: '742837716' },
  { id: '741826958', name: 'Liverpool Street', platform: 'booker', bookerId: '741826958' },
  { id: '741169854', name: 'Stockley Park', platform: 'booker', bookerId: '741169854' },
  { id: '741169839', name: 'Waterside', platform: 'booker', bookerId: '741169839' },
  { id: '740328096', name: 'GX', platform: 'booker', bookerId: '740328096' },
  { id: '742433466', name: 'Marlow', platform: 'booker', bookerId: '742433466' },
  { id: '743360644', name: 'Ealing', platform: 'booker', bookerId: '743360644' },
  { id: '743360677', name: 'Conductor/Westfield', platform: 'booker', bookerId: '743360677' },
];

export default function UploadPage() {
  const [stores, setStores] = useState<Store[]>(PREDEFINED_STORES);
  const [message, setMessage] = useState('');
  const [messageType, setMessageType] = useState<'success' | 'error'>('success');
  const [filterPlatform, setFilterPlatform] = useState<'all' | 'takemypayments' | 'booker' | 'paypal' | 'supplier'>('all');

  // Supplier Report state
  interface SupplierStatus {
    uploaded: boolean;
    lineCount: number;
    lastUploaded: string | null;
    stores: string[];
    months: string[];
  }
  const [supplierStatus, setSupplierStatus] = useState<SupplierStatus>({
    uploaded: false, lineCount: 0, lastUploaded: null, stores: [], months: [],
  });
  const [isUploadingSupplier, setIsUploadingSupplier] = useState(false);

  // PayPal state
  const [paypalStatus, setPaypalStatus] = useState<PayPalStatus>({
    synced: false,
    transactionCount: 0,
    lastSynced: null,
    syncedFrom: null,
    syncedTo: null,
  });
  const [isSyncingPayPal, setIsSyncingPayPal] = useState(false);
  const [paypalStartYear, setPaypalStartYear] = useState('2020');

  useEffect(() => {
    fetchStoresStatus();
    fetchPayPalStatus();
    fetchSupplierStatus();
  }, []);

  const fetchSupplierStatus = async () => {
    try {
      const response = await fetch('/api/upload/status');
      if (response.ok) {
        const data = await response.json();
        const statusList: any[] = Array.isArray(data) ? data : (data.stores ?? []);
        const supplierEntry = statusList.find((s: any) => s.storeId === 'supplier-report');
        if (supplierEntry) {
          setSupplierStatus({
            uploaded: true,
            lineCount: supplierEntry.transactionCount || 0,
            lastUploaded: supplierEntry.lastUploaded || null,
            stores: [],
            months: [],
          });
        }
      }
    } catch (error) {
      console.error('Failed to fetch supplier status:', error);
    }
  };

  const handleSupplierUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;
    setIsUploadingSupplier(true);
    setMessage('');
    try {
      const formData = new FormData();
      formData.append('file', file);
      const response = await fetch('/api/upload/purchasing', { method: 'POST', body: formData });
      const data = await response.json();
      if (data.success) {
        setMessage(data.message || `Successfully imported ${data.lineCount} line items!`);
        setMessageType('success');
        setSupplierStatus({
          uploaded: true,
          lineCount: data.lineCount,
          lastUploaded: new Date().toISOString(),
          stores: data.stores || [],
          months: data.months || [],
        });
      } else {
        setMessage(`Upload failed: ${data.error}`);
        setMessageType('error');
      }
    } catch {
      setMessage('Supplier report upload failed. Please try again.');
      setMessageType('error');
    } finally {
      setIsUploadingSupplier(false);
      event.target.value = '';
    }
  };

  const fetchStoresStatus = async () => {
    try {
      const response = await fetch('/api/upload/status');
      if (response.ok) {
        const data = await response.json();
        const statusList: any[] = Array.isArray(data) ? data : (data.stores ?? []);
        setStores(prevStores => 
          prevStores.map(store => {
            const status = statusList.find((s: any) => s.storeId === store.id);
            return status ? { ...store, ...status } : store;
          })
        );
      }
    } catch (error) {
      console.error('Failed to fetch store status:', error);
    }
  };

  const fetchPayPalStatus = async () => {
    try {
      const response = await fetch('/api/paypal/status');
      if (response.ok) {
        const data = await response.json();
        if (data.success) {
          setPaypalStatus({
            synced: data.synced,
            transactionCount: data.transactionCount,
            lastSynced: data.lastSynced,
            syncedFrom: data.syncedFrom,
            syncedTo: data.syncedTo,
          });
        }
      }
    } catch (error) {
      console.error('Failed to fetch PayPal status:', error);
    }
  };

  const handlePayPalSync = async () => {
    setIsSyncingPayPal(true);
    setMessage('');
    try {
      const response = await fetch('/api/paypal/sync', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ startFromDate: `${paypalStartYear}-01-01` }),
      });
      const data = await response.json();
      if (data.success) {
        setMessage(`Successfully synced ${data.transactionCount.toLocaleString()} PayPal transactions!`);
        setMessageType('success');
        await fetchPayPalStatus();
      } else {
        setMessage(`PayPal sync failed: ${data.error}`);
        setMessageType('error');
      }
    } catch (error) {
      setMessage('PayPal sync failed. Please check your credentials and try again.');
      setMessageType('error');
    } finally {
      setIsSyncingPayPal(false);
    }
  };

  const handleFileSelect = async (storeId: string, event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    const store = stores.find(s => s.id === storeId);
    if (!store) return;

    // Update uploading status
    setStores(prevStores => 
      prevStores.map(s => s.id === storeId ? { ...s, isUploading: true } : s)
    );
    setMessage('');

    try {
      const formData = new FormData();
      formData.append('file', file);
      formData.append('storeId', store.id);
      formData.append('storeName', store.name);
      formData.append('platform', store.platform);
      if (store.outletId) formData.append('outletId', store.outletId);
      if (store.mid) formData.append('mid', store.mid);
      if (store.bookerId) formData.append('bookerId', store.bookerId.toString());

      const response = await fetch('/api/upload/store', {
        method: 'POST',
        body: formData
      });

      const data = await response.json();

      if (data.success) {
        setMessage(`Successfully uploaded ${data.transactionCount} transactions for ${store.name}!`);
        setMessageType('success');
        
        // Update store status
        setStores(prevStores => 
          prevStores.map(s => s.id === storeId 
            ? { 
                ...s, 
                isUploading: false, 
                lastUploaded: data.lastUploaded,
                transactionCount: data.transactionCount 
              } 
            : s
          )
        );
        
        // Refresh status
        fetchStoresStatus();
      } else {
        let errorMsg = data.error || 'Upload failed';
        
        // Add column information if available
        if (data.foundColumns) {
          errorMsg += `\n\nColumns in your file: ${data.foundColumns}`;
        }
        
        // Log sample data to browser console for debugging
        if (data.sampleRow) {
          console.error('Sample row from file:', data.sampleRow);
        }
        
        setMessage(`Error: ${errorMsg}`);
        setMessageType('error');
        setStores(prevStores => 
          prevStores.map(s => s.id === storeId ? { ...s, isUploading: false } : s)
        );
      }
    } catch (error) {
      setMessage(`Failed to upload file for ${store.name}. Please try again.`);
      setMessageType('error');
      setStores(prevStores => 
        prevStores.map(s => s.id === storeId ? { ...s, isUploading: false } : s)
      );
    }

    // Reset file input
    event.target.value = '';
  };

  const filteredStores = filterPlatform === 'all' 
    ? stores 
    : filterPlatform === 'paypal'
    ? []
    : stores.filter(s => s.platform === filterPlatform);

  const uniqueStoreCount = new Set(stores.map(s => s.name)).size; // 11 unique café locations
  const uploadedCount = stores.filter(s => s.lastUploaded).length + (paypalStatus.synced ? 1 : 0);
  const totalTransactions = stores.reduce((sum, s) => sum + (s.transactionCount || 0), 0) + paypalStatus.transactionCount;

  return (
    <DashboardLayout>
      <div className="p-8 max-w-full overflow-x-hidden">
        {/* Header */}
        <div className="mb-6">
          <h1 className="text-4xl font-bold text-slate-900 tracking-tight">Manage Store Data</h1>
          <p className="text-base text-slate-600 mt-2 font-medium">
            Upload data files individually for each store
          </p>
        </div>

        {/* Summary Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-5 mb-6">
          <Card className="p-5 border border-slate-200 hover:shadow-md transition-shadow duration-200">
            <div className="flex items-center gap-4">
              <div className="p-3 bg-gradient-to-br from-slate-100 to-slate-200 rounded-xl">
                <svg className="w-6 h-6 text-slate-700" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                </svg>
              </div>
              <div>
                <p className="text-sm text-slate-600 font-medium">Total Stores</p>
                <p className="text-3xl font-bold text-slate-900">{uniqueStoreCount}</p>
              </div>
            </div>
          </Card>

          <Card className="p-5 border border-emerald-200 hover:shadow-md transition-shadow duration-200">
            <div className="flex items-center gap-4">
              <div className="p-3 bg-gradient-to-br from-emerald-100 to-emerald-200 rounded-xl">
                <svg className="w-6 h-6 text-emerald-700" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <div>
                <p className="text-sm text-slate-600 font-medium">Uploaded</p>
                <p className="text-3xl font-bold text-emerald-700">{uploadedCount}</p>
              </div>
            </div>
          </Card>

          <Card className="p-5 border border-blue-200 hover:shadow-md transition-shadow duration-200">
            <div className="flex items-center gap-4">
              <div className="p-3 bg-gradient-to-br from-blue-100 to-blue-200 rounded-xl">
                <svg className="w-6 h-6 text-blue-700" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                </svg>
              </div>
              <div>
                <p className="text-sm text-slate-600 font-medium">Total Transactions</p>
                <p className="text-3xl font-bold text-blue-700">{totalTransactions.toLocaleString()}</p>
              </div>
            </div>
          </Card>
        </div>

        {/* Filter Tabs */}
        <div className="flex flex-wrap gap-3 mb-6">
          <Button 
            variant={filterPlatform === 'all' ? 'primary' : 'outline'}
            onClick={() => setFilterPlatform('all')}
            size="sm"
            className="font-medium"
          >
            All Sources ({stores.length + 1})
          </Button>
          <Button 
            variant={filterPlatform === 'takemypayments' ? 'primary' : 'outline'}
            onClick={() => setFilterPlatform('takemypayments')}
            size="sm"
            className="font-medium"
          >
            TakeMyPayments ({stores.filter(s => s.platform === 'takemypayments').length})
          </Button>
          <Button 
            variant={filterPlatform === 'booker' ? 'primary' : 'outline'}
            onClick={() => setFilterPlatform('booker')}
            size="sm"
            className="font-medium"
          >
            Booker ({stores.filter(s => s.platform === 'booker').length})
          </Button>
          <Button
            variant={filterPlatform === 'paypal' ? 'primary' : 'outline'}
            onClick={() => setFilterPlatform('paypal')}
            size="sm"
            className="font-medium"
          >
            PayPal {paypalStatus.synced ? `(${paypalStatus.transactionCount.toLocaleString()} txns)` : '(Not Synced)'}
          </Button>
          <Button
            variant={filterPlatform === 'supplier' ? 'primary' : 'outline'}
            onClick={() => setFilterPlatform('supplier')}
            size="sm"
            className="font-medium"
          >
            Supplier Report {supplierStatus.uploaded ? `(${supplierStatus.lineCount.toLocaleString()} lines)` : '(Not Uploaded)'}
          </Button>
        </div>

        {/* Supplier Report Section */}
        {filterPlatform === 'supplier' && (
          <div className="mb-6">
            <Card className="p-6 border border-violet-200 bg-gradient-to-br from-violet-50 to-white">
              <div className="flex items-start gap-5">
                {/* Icon */}
                <div className="p-3 bg-violet-600 rounded-xl shadow-md flex-shrink-0">
                  <svg className="w-7 h-7 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 17v-2m3 2v-4m3 4v-6m2 10H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                  </svg>
                </div>

                <div className="flex-1">
                  <div className="flex items-center justify-between mb-3">
                    <div>
                      <h2 className="text-xl font-bold text-slate-900">Supplier Purchasing Report <span className="text-base font-semibold text-slate-500">· Booker Excel</span></h2>
                      <p className="text-sm text-slate-500 mt-0.5">Upload the Booker Excel report to analyse product purchasing across all sites</p>
                    </div>
                    <div className={`px-3 py-1.5 rounded-full text-xs font-semibold ${
                      supplierStatus.uploaded
                        ? 'bg-emerald-100 text-emerald-700'
                        : 'bg-amber-100 text-amber-700'
                    }`}>
                      {supplierStatus.uploaded ? 'Uploaded' : 'Not Uploaded'}
                    </div>
                  </div>

                  {supplierStatus.uploaded && (
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-5">
                      <div className="bg-white rounded-lg p-3 border border-violet-100">
                        <p className="text-xs text-slate-500 font-medium">Line Items</p>
                        <p className="text-2xl font-bold text-violet-700">{supplierStatus.lineCount.toLocaleString()}</p>
                      </div>
                      <div className="bg-white rounded-lg p-3 border border-violet-100">
                        <p className="text-xs text-slate-500 font-medium">Last Uploaded</p>
                        <p className="text-sm font-semibold text-slate-800">
                          {supplierStatus.lastUploaded
                            ? new Date(supplierStatus.lastUploaded).toLocaleString('en-GB', {
                                day: '2-digit', month: '2-digit', year: 'numeric',
                                hour: '2-digit', minute: '2-digit',
                              })
                            : '—'}
                        </p>
                      </div>
                      {supplierStatus.stores.length > 0 && (
                        <div className="bg-white rounded-lg p-3 border border-violet-100">
                          <p className="text-xs text-slate-500 font-medium">Stores</p>
                          <p className="text-sm font-semibold text-slate-800">{supplierStatus.stores.length}</p>
                        </div>
                      )}
                      {supplierStatus.months.length > 0 && (
                        <div className="bg-white rounded-lg p-3 border border-violet-100">
                          <p className="text-xs text-slate-500 font-medium">Period</p>
                          <p className="text-sm font-semibold text-slate-800">
                            {supplierStatus.months[0]} – {supplierStatus.months[supplierStatus.months.length - 1]}
                          </p>
                        </div>
                      )}
                    </div>
                  )}

                  <div className="flex flex-wrap items-center gap-3">
                    <div className="text-xs text-slate-500 bg-slate-100 rounded-lg px-3 py-2">
                      Accepts <strong>.xlsx</strong> or <strong>.xls</strong> files with a <strong>Line_Data</strong> sheet
                    </div>
                    <input
                      type="file"
                      accept=".xlsx,.xls"
                      onChange={handleSupplierUpload}
                      className="hidden"
                      id="supplier-report-input"
                      disabled={isUploadingSupplier}
                    />
                    <Button
                      onClick={() => document.getElementById('supplier-report-input')?.click()}
                      disabled={isUploadingSupplier}
                      className="flex items-center gap-2 bg-violet-600 hover:bg-violet-700 text-white px-5 py-2.5"
                    >
                      {isUploadingSupplier ? (
                        <>
                          <svg className="animate-spin h-4 w-4" fill="none" viewBox="0 0 24 24">
                            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                          </svg>
                          <span>Importing...</span>
                        </>
                      ) : (
                        <>
                          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
                          </svg>
                          <span>{supplierStatus.uploaded ? 'Re-upload Report' : 'Upload Supplier Report'}</span>
                        </>
                      )}
                    </Button>
                  </div>
                </div>
              </div>
            </Card>
          </div>
        )}

        {/* PayPal Section */}
        {filterPlatform === 'paypal' && (
          <div className="mb-6">
            <Card className="p-6 border border-blue-200 bg-gradient-to-br from-blue-50 to-white">
              <div className="flex items-start gap-5">
                {/* PayPal Logo Icon */}
                <div className="p-3 bg-blue-600 rounded-xl shadow-md flex-shrink-0">
                  <svg className="w-7 h-7 text-white" viewBox="0 0 24 24" fill="currentColor">
                    <path d="M7.076 21.337H2.47a.641.641 0 0 1-.633-.74L4.944.901C5.026.382 5.474 0 5.998 0h7.46c2.57 0 4.578.543 5.69 1.81 1.01 1.15 1.304 2.42 1.012 4.287-.023.143-.047.288-.077.437-.983 5.05-4.349 6.797-8.647 6.797h-2.19c-.524 0-.968.382-1.05.9l-1.12 7.106zm14.146-14.42a3.35 3.35 0 0 0-.607-.541c-.013.076-.026.175-.041.254-.94 4.836-4.154 7.32-9.114 7.32h-2.19a2.16 2.16 0 0 0-2.137 1.83l-1.12 7.106-.314 1.995h3.917l.924-5.855a1.05 1.05 0 0 1 1.037-.887h.655c4.249 0 7.57-1.727 8.543-6.722.42-2.152.2-3.948-.553-5.5z"/>
                  </svg>
                </div>

                <div className="flex-1">
                  <div className="flex items-center justify-between mb-3">
                    <div>
                      <h2 className="text-xl font-bold text-slate-900">PayPal Integration <span className="text-base font-semibold text-slate-500">· GX</span></h2>
                      <p className="text-sm text-slate-500 mt-0.5">Sync all-time transaction data via PayPal REST API</p>
                    </div>
                    <div className={`px-3 py-1.5 rounded-full text-xs font-semibold ${
                      paypalStatus.synced
                        ? 'bg-emerald-100 text-emerald-700'
                        : 'bg-amber-100 text-amber-700'
                    }`}>
                      {paypalStatus.synced ? 'Synced' : 'Never Synced'}
                    </div>
                  </div>

                  {paypalStatus.synced && (
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-5">
                      <div className="bg-white rounded-lg p-3 border border-blue-100">
                        <p className="text-xs text-slate-500 font-medium">Transactions</p>
                        <p className="text-2xl font-bold text-blue-700">{paypalStatus.transactionCount.toLocaleString()}</p>
                      </div>
                      <div className="bg-white rounded-lg p-3 border border-blue-100">
                        <p className="text-xs text-slate-500 font-medium">Last Synced</p>
                        <p className="text-sm font-semibold text-slate-800">
                          {paypalStatus.lastSynced
                            ? new Date(paypalStatus.lastSynced).toLocaleString('en-GB', {
                                day: '2-digit', month: '2-digit', year: 'numeric',
                                hour: '2-digit', minute: '2-digit',
                              })
                            : '—'}
                        </p>
                      </div>
                      <div className="bg-white rounded-lg p-3 border border-blue-100">
                        <p className="text-xs text-slate-500 font-medium">Data From</p>
                        <p className="text-sm font-semibold text-slate-800">
                          {paypalStatus.syncedFrom
                            ? new Date(paypalStatus.syncedFrom).toLocaleDateString('en-GB')
                            : '—'}
                        </p>
                      </div>
                      <div className="bg-white rounded-lg p-3 border border-blue-100">
                        <p className="text-xs text-slate-500 font-medium">Data To</p>
                        <p className="text-sm font-semibold text-slate-800">
                          {paypalStatus.syncedTo
                            ? new Date(paypalStatus.syncedTo).toLocaleDateString('en-GB')
                            : '—'}
                        </p>
                      </div>
                    </div>
                  )}

                  <div className="flex flex-wrap items-center gap-3">
                    <div className="flex items-center gap-2">
                      <label className="text-xs font-medium text-slate-600 whitespace-nowrap">Fetch from year:</label>
                      <select
                        value={paypalStartYear}
                        onChange={(e) => setPaypalStartYear(e.target.value)}
                        disabled={isSyncingPayPal}
                        className="text-sm border border-slate-200 rounded-lg px-3 py-2 bg-white text-slate-800 font-medium focus:outline-none focus:ring-2 focus:ring-blue-400"
                      >
                        {Array.from({ length: new Date().getFullYear() - 2013 }, (_, i) => String(2014 + i)).reverse().map(year => (
                          <option key={year} value={year}>{year}</option>
                        ))}
                      </select>
                    </div>
                    <Button
                      onClick={handlePayPalSync}
                      disabled={isSyncingPayPal}
                      className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-5 py-2.5"
                    >
                      {isSyncingPayPal ? (
                        <>
                          <svg className="animate-spin h-4 w-4" fill="none" viewBox="0 0 24 24">
                            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                          </svg>
                          <span>Syncing from {paypalStartYear}... (may take a minute)</span>
                        </>
                      ) : (
                        <>
                          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                          </svg>
                          <span>{paypalStatus.synced ? `Re-sync from ${paypalStartYear}` : `Get PayPal Data from ${paypalStartYear}`}</span>
                        </>
                      )}
                    </Button>
                  </div>
                </div>
              </div>
            </Card>
          </div>
        )}

        {/* Stores Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5 mb-6">
          {filteredStores.map(store => (
            <Card key={store.id} className="p-5 hover:shadow-lg transition-shadow duration-200 border border-slate-200">
              <div className="flex items-start justify-between mb-4">
                <div className="flex-1">
                  <h3 className="font-semibold text-slate-900 text-base leading-tight">{store.name}</h3>
                  <p className="text-xs text-slate-500 mt-1.5 font-medium">
                    {store.platform === 'takemypayments' ? 'TakeMyPayments' : 'Booker'}
                  </p>
                </div>
                <div className={`px-2.5 py-1 rounded-full text-xs font-semibold ${
                  store.lastUploaded 
                    ? 'bg-emerald-100 text-emerald-700' 
                    : 'bg-slate-100 text-slate-600'
                }`}>
                  {store.lastUploaded ? 'Active' : 'No Data'}
                </div>
              </div>

              <div className="space-y-2.5 mb-5 text-xs text-slate-600">
                {store.outletId && (
                  <div className="flex justify-between">
                    <span>Outlet ID:</span>
                    <span className="font-medium text-slate-900">{store.outletId}</span>
                  </div>
                )}
                {store.mid && (
                  <div className="flex justify-between">
                    <span>MID:</span>
                    <span className="font-medium text-slate-900">{store.mid}</span>
                  </div>
                )}
                {store.bookerId && (
                  <div className="flex justify-between">
                    <span>Booker ID:</span>
                    <span className="font-medium text-slate-900">{store.bookerId}</span>
                  </div>
                )}
                {store.lastUploaded && (
                  <div className="flex justify-between">
                    <span>Last Upload:</span>
                    <span className="font-medium text-slate-900">
                      {new Date(store.lastUploaded).toLocaleString('en-GB', {
                        day: '2-digit',
                        month: '2-digit',
                        year: 'numeric',
                        hour: '2-digit',
                        minute: '2-digit'
                      })}
                    </span>
                  </div>
                )}
                {store.transactionCount !== undefined && store.transactionCount > 0 && (
                  <div className="flex justify-between">
                    <span>Transactions:</span>
                    <span className="font-medium text-slate-900">
                      {store.transactionCount.toLocaleString()}
                    </span>
                  </div>
                )}
              </div>

              <div>
                <input
                  type="file"
                  accept=".csv,.xlsx,.xls"
                  onChange={(e) => handleFileSelect(store.id, e)}
                  className="hidden"
                  id={`file-${store.id}`}
                  disabled={store.isUploading}
                />
                <label htmlFor={`file-${store.id}`} className="block">
                  <Button 
                    type="button" 
                    onClick={() => document.getElementById(`file-${store.id}`)?.click()}
                    disabled={store.isUploading}
                    className="w-full flex items-center justify-center"
                    size="sm"
                  >
                    {store.isUploading ? (
                      <>
                        <svg className="animate-spin h-4 w-4 mr-2" fill="none" viewBox="0 0 24 24">
                          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                        </svg>
                        <span>Uploading...</span>
                      </>
                    ) : (
                      <>
                        <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
                        </svg>
                        <span>{store.lastUploaded ? 'Update Data' : 'Upload Data'}</span>
                      </>
                    )}
                  </Button>
                </label>
              </div>
            </Card>
          ))}

          {/* PayPal card in All Stores view */}
          {filterPlatform === 'all' && (
            <Card className="p-5 hover:shadow-lg transition-shadow duration-200 border border-blue-200 bg-gradient-to-br from-blue-50 to-white">
              <div className="flex items-start justify-between mb-4">
                <div className="flex-1">
                  <h3 className="font-semibold text-slate-900 text-base leading-tight">PayPal</h3>
                  <p className="text-xs text-slate-500 mt-1.5 font-medium">PayPal REST API</p>
                </div>
                <div className={`px-2.5 py-1 rounded-full text-xs font-semibold ${
                  paypalStatus.synced ? 'bg-emerald-100 text-emerald-700' : 'bg-slate-100 text-slate-600'
                }`}>
                  {paypalStatus.synced ? 'Active' : 'No Data'}
                </div>
              </div>

              <div className="space-y-2.5 mb-5 text-xs text-slate-600">
                {paypalStatus.lastSynced && (
                  <div className="flex justify-between">
                    <span>Last Synced:</span>
                    <span className="font-medium text-slate-900">
                      {new Date(paypalStatus.lastSynced).toLocaleString('en-GB', {
                        day: '2-digit', month: '2-digit', year: 'numeric',
                        hour: '2-digit', minute: '2-digit',
                      })}
                    </span>
                  </div>
                )}
                {paypalStatus.syncedFrom && (
                  <div className="flex justify-between">
                    <span>Data From:</span>
                    <span className="font-medium text-slate-900">{new Date(paypalStatus.syncedFrom).toLocaleDateString('en-GB')}</span>
                  </div>
                )}
                {paypalStatus.transactionCount > 0 && (
                  <div className="flex justify-between">
                    <span>Transactions:</span>
                    <span className="font-medium text-slate-900">{paypalStatus.transactionCount.toLocaleString()}</span>
                  </div>
                )}
              </div>

              <Button
                onClick={() => setFilterPlatform('paypal')}
                className="w-full flex items-center justify-center"
                size="sm"
              >
                <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                </svg>
                <span>{paypalStatus.synced ? 'Re-sync PayPal' : 'Sync PayPal Data'}</span>
              </Button>
            </Card>
          )}
        </div>

        {/* Message */}
        {message && (
          <Card className={`p-5 shadow-md ${messageType === 'success' ? 'bg-emerald-50 border-emerald-300' : 'bg-rose-50 border-rose-300'}`}>
            <div className="flex items-center gap-3">
              {messageType === 'success' ? (
                <svg className="w-6 h-6 text-emerald-600 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                </svg>
              ) : (
                <svg className="w-6 h-6 text-rose-600 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                </svg>
              )}
              <p className={`text-sm font-medium whitespace-pre-line ${messageType === 'success' ? 'text-emerald-900' : 'text-rose-900'}`}>
                {message}
              </p>
            </div>
          </Card>
        )}
      </div>
    </DashboardLayout>
  );
}
