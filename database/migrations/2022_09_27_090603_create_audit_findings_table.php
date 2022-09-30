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
        Schema::create('audit_findings', function (Blueprint $table) {
            $table->id();
            $table->string('code', 16);
            $table->foreignId('record_id')->nullable()->constrained('audit_records');
            $table->string('ca_code', 16);
            $table->string('ca_name');
            $table->double('ca_weight');
            $table->string('cg_code', 16);
            $table->string('cg_name');
            $table->tinyInteger('category');
            $table->text('desc');
            $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     *
     * @return void
     */
    public function down()
    {
        Schema::dropIfExists('audit_findings');
    }
};
