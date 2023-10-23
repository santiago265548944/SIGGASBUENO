import { Component, OnInit, OnDestroy } from '@angular/core';
import { MapService } from '../map-service/map.service';
// tslint:disable-next-line:import-blacklist
import { Subscription } from 'rxjs';
import { BookmarkAction, BookmarkActionType } from '../map-service/map-actions/bookmark-action';
import { EmapActions } from '../map-service/emap-actions.enum';
import { loadModules } from 'esri-loader';
import { MemoryService } from '../cache/memory.service';
import * as _ from 'underscore';

@Component({
  selector: 'app-bookmark',
  templateUrl: './bookmark.component.html',
  styleUrls: ['./bookmark.component.css']
})
export class BookmarkComponent implements OnInit, OnDestroy {
  subscription: Subscription;
  BookmarkItem: any;
  bookmarks: Array<BookmarkItem>;
  bookmarkName: string;
  private storageKey = 'BookmarkStorage';
  selectedBookmark: any;
  map: any;

  constructor(private mapService: MapService, private memoryService: MemoryService) {
    this.subscription = this.mapService
      .getMapAction()
      .subscribe(mapAction => this.executeBookmarkAction(mapAction));
  }

  ngOnInit() {
    this.mapService.executeMapAction(<BookmarkAction> {EMapAction: EmapActions.Bookmark
      , bookmarkActionType: BookmarkActionType.BookmarkInitRequest});
  }

  executeBookmarkAction(bookmarkAction: BookmarkAction) {
    if (bookmarkAction.EMapAction === EmapActions.Bookmark) {
      switch (bookmarkAction.bookmarkActionType) {
        case BookmarkActionType.BookmarkInitResponse:
          this.configureBookmark(bookmarkAction);
          break;
      }
    }
  }

  private configureBookmark(bookmarkAction: BookmarkAction): void {
    this.map = bookmarkAction.map;
    this.loadBookmarks();
  }

  addBookmark(): void {
    if (this.bookmarkName != null && this.bookmarkName.trim() !== '') {
      if (!this.existsBookmarkItem()) {
        this.bookmarks.unshift(new BookmarkItem(this.bookmarkName, this.map.extent));
        this.bookmarkName = '';
        this.saveToStorage();
      } else {
        alert('Ya existe un marcador con ese nombre');
      }
    } else {
      alert('Debe ingresar un nombre para el marcador');
    }
  }

  private saveToStorage(): void {
    this.memoryService.setItem(this.storageKey, JSON.stringify(this.bookmarks));
  }

  private loadBookmarks(): void {
    const bookmarksJson = this.memoryService.getItem(this.storageKey);
    this.bookmarks = new Array<BookmarkItem>();
    if (bookmarksJson != null) {
      this.bookmarks = JSON.parse(bookmarksJson);
    }
  }

  deleteBookmark(): void {
    if (this.selectedBookmark != null) {
      const index = this.bookmarks.indexOf(this.selectedBookmark);
      if (index >= 0) {
        this.bookmarks.splice(index, 1);
        this.selectedBookmark = null;
        this.saveToStorage();
      }
    }
  }

  zoomToBookmark(): void {
    if (this.selectedBookmark != null) {
      loadModules(
      [
        'esri/geometry/Extent',
        'esri/SpatialReference'
      ],
      {url: 'https://js.arcgis.com/3.23/'}
    )
    .then(
        ([
          Extent,
          SpatialReference
        ]) => {
          const extent = new Extent(this.selectedBookmark.extent.xmin
            , this.selectedBookmark.extent.ymin
            , this.selectedBookmark.extent.xmax
            , this.selectedBookmark.extent.ymax
            , new SpatialReference({wkid: this.selectedBookmark.extent.spatialReference.wkid}));
          this.map.setExtent(extent);
        }
      );
    }
  }

  deleteAllBookmarks(): void {
    this.selectedBookmark = null;
    this.bookmarks = new Array<any>();
    this.saveToStorage();
  }

  existsBookmarkItem(): boolean {
    let result = false;
    if (this.bookmarks != null) {
      const foundElement = _.find(this.bookmarks, (element) => {
        return element.name === this.bookmarkName;
      });
      result = foundElement != null;
    }
    return result;
  }


  ngOnDestroy(): void {
    if (this.subscription != null) {
      this.subscription.unsubscribe();
    }
  }
}

class BookmarkItem {
  name: string;
  extent: any;
  constructor(name: string, extent: any) {
    this.name = name;
    this.extent = extent;
  }
}
