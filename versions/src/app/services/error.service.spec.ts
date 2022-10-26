import { HttpClient } from '@angular/common/http';
import { HttpClientTestingModule } from '@angular/common/http/testing';
import { TestBed } from '@angular/core/testing';
import { ErrorService } from './error.service';

describe('ErrorService', () => {
  let service: ErrorService;

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [HttpClientTestingModule],
      providers: [HttpClient, ErrorService],
    });
    service = TestBed.inject(ErrorService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  it('errorEmitter should work correctly', (done) => {
    const mockValue = 'test';
    service.errorEmitter.subscribe((err: Error) => {
      expect(err.message).toBe(mockValue);
      done();
    });
    service.handleError(new Error(mockValue));
  });
});
