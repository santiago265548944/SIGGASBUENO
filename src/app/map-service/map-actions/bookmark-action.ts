import { MapAction } from '../map-action';

export interface BookmarkAction extends MapAction {
  bookmarkActionType: BookmarkActionType;
  map: any;
}

export enum BookmarkActionType {
  BookmarkInitRequest = 1,
  BookmarkInitResponse = 2
}
