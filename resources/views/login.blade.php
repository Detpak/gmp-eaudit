<x-layouts.main>
    <div class="container-fluid h-100">
        <div class="row">
            <div class="col-lg"></div>
            <div class="col mt-4">
                <div class="card">
                    <form class="card-body p-4" action="{{ url("auth?redirect={$redirect}") }}" method="POST">
                        @csrf
                        <h3 class="card-title mb-3 fw-bold text-center">MyAudit+</h3>
                        <h5 class="card-title mb-3 fw-bold text-center">GMP Audit Tools</h5>
                        @error('loginMsg')
                            <div class="mb-2 text-danger text-center">{{ $message }}</div>
                        @enderror
                        <div class="mb-3">
                            <label for="loginID" class="form-label">Username</label>
                            <input type="text" class="form-control @error('loginID') is-invalid @enderror" value="{{ old('loginID') }}" id="loginID" name="loginID">
                            @error('loginID')
                            <div class="invalid-feedback">
                                {{ $message }}
                            </div>
                            @enderror()
                        </div>
                        <div class="mb-3">
                            <label for="loginPassword" class="form-label">Password</label>
                            <input type="password" class="form-control @error('loginPassword') is-invalid @enderror" id="loginPassword" name="loginPassword">
                            @error('loginPassword')
                            <div class="invalid-feedback">
                                {{ $message }}
                            </div>
                            @enderror()
                        </div>
                        <div class="d-grid gap-2 d-md-flex justify-content-md-end">
                            <button class="btn btn-primary" type="submit">Login</button>
                        </div>
                    </form>
                </div>
            </div>
            <div class="col-lg"></div>
        </div>
    </div>
</x-layouts.main>
