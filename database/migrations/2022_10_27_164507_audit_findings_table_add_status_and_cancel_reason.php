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
        Schema::table('audit_findings', function (Blueprint $table) {
            $table->dropColumn('case_id');
            $table->tinyInteger('status')->default(0);
            $table->text('cancel_reason')->nullable();
        });
    }

    /**
     * Reverse the migrations.
     *
     * @return void
     */
    public function down()
    {
        Schema::table('audit_findings', function (Blueprint $table) {
            $table->dropColumn(['status', 'cancel_reason']);
            $table->unsignedBigInteger('case_id')->default(0);
        });
    }
};
