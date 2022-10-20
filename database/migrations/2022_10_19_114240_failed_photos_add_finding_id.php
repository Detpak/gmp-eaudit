<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Run the migrations.
     *
     * @return void
     */
    public function up()
    {
        Schema::table('failed_photos', function (Blueprint $table) {
            $table->dropConstrainedForeignId('record_id');
            $table->dropColumn('case_id');
            $table->id()->first();
            $table->foreignId('finding_id')->nullable()->constrained('audit_findings');
        });
    }

    /**
     * Reverse the migrations.
     *
     * @return void
     */
    public function down()
    {
        Schema::table('failed_photos', function (Blueprint $table) {
            $table->dropColumn('id');
            $table->dropConstrainedForeignId('finding_id');
            $table->foreignId('record_id')->nullable()->constrained('audit_records');
            $table->unsignedBigInteger('case_id')->default(0);
        });
    }
};
