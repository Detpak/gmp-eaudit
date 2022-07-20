<x-layouts.main title="e-Audit">
    <div class="container-fluid">
        <div class="row">
            <div class="col-lg"></div>
            <div class="col mt-4">
                <div class="card">
                    <form class="card-body p-4" action="{{ url('auth') }}" method="POST">
                        @csrf
                        <h4 class="card-title mb-3">Login e-Audit</h4>
                        <div class="mb-3">
                            <label for="loginID" class="form-label">ID</label>
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
                        <button class="btn btn-primary" type="submit">Login</button>
                    </form>
                </div>
            </div>
            <div class="col-lg"></div>
        </div>
    </div>
</x-layouts.main>
