import { Redirect } from 'expo-router';

export default function IndexPage() {
  // Redirect to the tabs layout
  return <Redirect href="/(tabs)" />;
}
