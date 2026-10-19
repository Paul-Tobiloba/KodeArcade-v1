export default function LoadingScreen({ embedded = false, label = 'Opening your learning workspace…' }: { embedded?: boolean; label?: string }) {
  const Container = embedded ? 'section' : 'main';
  return <Container className={embedded ? 'account-loading' : 'brand-loader'} role="status" aria-live="polite" aria-label="Loading KodeArcade">
    <img src="/brand/mark-loading.svg" alt="" width="88" height="88" />
    {embedded ? <h2>{label}</h2> : <><h1>KodeArcade</h1><p>{label}</p></>}
  </Container>;
}
