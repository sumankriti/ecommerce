import { Injectable } from '@angular/core';

export type RxjsTopic = {
  id: string;
  title: string;
  componentName: string;
  summary: string;
  analogy: string;
  useCases: string[];
  warning: string;
};

@Injectable({ providedIn: 'root' })
export class RxjsService {
  private readonly topics: RxjsTopic[] = [
    {
      id: 'switchmap',
      title: 'switchMap',
      componentName: 'SwitchMapComponent',
      summary: 'Use the latest value and cancel the previous inner stream.',
      analogy: 'Like a live search box where every new keystroke makes the previous request irrelevant.',
      useCases: [
        'Typeahead search requests',
        'Route-param-driven HTTP calls',
        'Latest-only refresh behavior',
      ],
      warning: 'Avoid it when every request must complete, because earlier inner streams are cancelled.',
    },
    {
      id: 'switchmap2',
      title: 'switchMap2',
      componentName: 'SwitchMapComponent2',
      summary: 'Use the latest value and cancel the previous inner stream.',
      analogy: 'Like a live search box where every new keystroke makes the previous request irrelevant.',
      useCases: [
        'Typeahead search requests',
        'Route-param-driven HTTP calls',
        'Latest-only refresh behavior',
      ],
      warning: 'Avoid it when every request must complete, because earlier inner streams are cancelled.',
    },
    {
      id: 'switchmap3',
      title: 'switchMap3',
      componentName: 'SwitchMapComponent3',
      summary: 'Use the latest value and cancel the previous inner stream.',
      analogy: 'Like a live search box where every new keystroke makes the previous request irrelevant.',
      useCases: [
        'Typeahead search requests',
        'Route-param-driven HTTP calls',
        'Latest-only refresh behavior',
      ],
      warning: 'Avoid it when every request must complete, because earlier inner streams are cancelled.',
    },
    {
      id: 'concatmap',
      title: 'concatMap',
      componentName: 'ConcatMapModalComponent',
      summary: 'Queue source values and process them one at a time in order.',
      analogy: 'Like a checkout line where each customer waits for the previous one to finish.',
      useCases: [
        'Sequential API writes',
        'Ordered save operations',
        'Task queues where completion order matters',
      ],
      warning: 'Long-running inner streams can build up a backlog and make the UI feel slow.',
    },
    {
      id: 'mergemap',
      title: 'mergeMap',
      componentName: 'MergeMapModalComponent',
      summary: 'Run multiple inner streams in parallel without waiting for order.',
      analogy: 'Like assigning several workers to different tasks at the same time.',
      useCases: [
        'Independent background requests',
        'Parallel enrichment calls',
        'Bulk operations where order is not important',
      ],
      warning: 'Parallel work can produce race conditions or unordered results if you are not careful.',
    },
    {
      id: 'exhaustmap',
      title: 'exhaustMap',
      componentName: 'ExhaustMapModalComponent',
      summary: 'Ignore new source values while the current inner stream is still active.',
      analogy: 'Like a submit button that ignores repeated clicks until the first request finishes.',
      useCases: [
        'Preventing duplicate form submission',
        'Login button protection',
        'Single-flight request handling',
      ],
      warning: 'New source values are dropped while work is in progress, so it is not right for latest-value flows.',
    },
  ];

  getTopics(): RxjsTopic[] {
    return this.topics;
  }

  getTopicById(topicId: string): RxjsTopic | undefined {
    return this.topics.find((topic) => topic.id === topicId);
  }
}
