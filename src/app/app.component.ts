import { Component, OnInit } from '@angular/core';
import { MemoryService } from './cache/memory.service';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css']
})
export class AppComponent implements OnInit {

  constructor(private memoryService: MemoryService) {}
  ngOnInit(): void {

  }
}
