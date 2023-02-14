/**
 * Copyright (c) Meta Platforms, Inc. and affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 *
 * @flow strict
 * @format
 */

import type {
  GetPendingEntriesResult,
  RawPerformanceEntry,
  Spec as NativePerformanceObserver,
} from '../NativePerformanceObserver';

import {RawPerformanceEntryType} from '../NativePerformanceObserver';

const reportingType: Set<RawPerformanceEntryType> = new Set();
const durationThresholds: Map<RawPerformanceEntryType, number> = new Map();
const eventCounts: Map<string, number> = new Map();
let entries: Array<RawPerformanceEntry> = [];
let onPerformanceEntryCallback: ?() => void;

export const NativePerformanceObserverMock: NativePerformanceObserver = {
  startReporting: (entryType: RawPerformanceEntryType) => {
    reportingType.add(entryType);
  },

  stopReporting: (entryType: RawPerformanceEntryType) => {
    reportingType.delete(entryType);
    durationThresholds.delete(entryType);
  },

  popPendingEntries: (): GetPendingEntriesResult => {
    const res = entries;
    entries = [];
    return {
      droppedEntriesCount: 0,
      entries: res,
    };
  },

  setOnPerformanceEntryCallback: (callback?: () => void) => {
    onPerformanceEntryCallback = callback;
  },

  logRawEntry: (entry: RawPerformanceEntry) => {
    if (reportingType.has(entry.entryType)) {
      const durationThreshold = durationThresholds.get(entry.entryType);
      if (
        durationThreshold !== undefined &&
        entry.duration < durationThreshold
      ) {
        return;
      }
      entries.push(entry);
      onPerformanceEntryCallback?.();
    }
    if (entry.entryType === RawPerformanceEntryType.EVENT) {
      eventCounts.set(entry.name, (eventCounts.get(entry.name) ?? 0) + 1);
    }
  },

  setDurationThreshold: (
    entryType: RawPerformanceEntryType,
    durationThreshold: number,
  ) => {
    durationThresholds.set(entryType, durationThreshold);
  },

  getEventCounts: (): $ReadOnlyArray<[string, number]> => {
    return Array.from(eventCounts.entries());
  },
};

export default NativePerformanceObserverMock;
