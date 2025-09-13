
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { CheckCircle2, AlertTriangle } from 'lucide-react';

const suggestions = [
  'Take 10 deep breaths, in through your nose and out through your mouth.',
  'Go for a brisk 15-minute walk to clear your head.',
  'Call or text a friend you trust and talk about it.',
  'Write down everything you are feeling, without judgment.',
  'Listen to a calming playlist or a guided meditation.',
  'Count quietly to ten before reacting.',
  'Try gentle stretches or yoga for relaxation.',
  'Imagine a peaceful place or memory.',
  'Use a little humor to lighten up the mood.',
  'Forgive and let go—don\'t hold a grudge',
];

const avoidances = [
  'Don’t raise your voice or shout at others.',
  'Don’t keep your feelings bottled up inside.',
  'Don’t make any big decisions while you are emotional.',
  'Avoid turning to unhealthy coping mechanisms.',
  'Don’t dwell on the anger; seek a constructive outlet.'
];

export default function StillAngryPage() {
  return (
    <div className="container mx-auto px-4 py-12">
      <div className="text-center mb-12">
        <h1 className="text-5xl md:text-7xl font-headline font-bold text-primary">Still Angry?</h1>
        <p className="mt-2 text-lg text-muted-foreground">That's okay. Here are some constructive ways to handle it.</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-5xl mx-auto">
        <Card className="bg-green-50 dark:bg-green-900/20 border-green-200 dark:border-green-800">
          <CardHeader>
            <CardTitle className="flex items-center gap-3 font-headline text-green-800 dark:text-green-300">
              <CheckCircle2 className="h-8 w-8" />
              What to Do
            </CardTitle>
          </CardHeader>
          <CardContent>
            <ul className="space-y-4">
              {suggestions.map((item, index) => (
                <li key={index} className="flex items-start">
                  <CheckCircle2 className="h-5 w-5 text-green-600 dark:text-green-400 mt-1 mr-3 flex-shrink-0" />
                  <span className="text-green-900 dark:text-green-200">{item}</span>
                </li>
              ))}
            </ul>
          </CardContent>
        </Card>

        <Card className="bg-red-50 dark:bg-red-900/20 border-red-200 dark:border-red-800">
          <CardHeader>
            <CardTitle className="flex items-center gap-3 font-headline text-red-800 dark:text-red-300">
              <AlertTriangle className="h-8 w-8" />
              What NOT to Do
            </CardTitle>
          </CardHeader>
          <CardContent>
            <ul className="space-y-4">
              {avoidances.map((item, index) => (
                <li key={index} className="flex items-start">
                  <AlertTriangle className="h-5 w-5 text-red-600 dark:text-red-400 mt-1 mr-3 flex-shrink-0" />
                  <span className="text-red-900 dark:text-red-200">{item}</span>
                </li>
              ))}
            </ul>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
