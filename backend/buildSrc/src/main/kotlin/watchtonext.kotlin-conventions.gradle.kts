import org.gradle.accessors.dm.LibrariesForLibs

plugins {
    kotlin("jvm")
    jacoco
}

group = "com.watchtonext"
version = "0.0.1-SNAPSHOT"

repositories {
    mavenCentral()
}

kotlin {
    jvmToolchain(24)
    compilerOptions {
        freeCompilerArgs.addAll("-Xjsr305=strict", "-Xannotation-default-target=param-property")
    }
}

val libs = the<LibrariesForLibs>()

dependencies {
    testImplementation(libs.junit.jupiter)
    testImplementation(libs.assertj.core)
    testImplementation(libs.mockk)
    testRuntimeOnly(libs.junit.platform.launcher)
}

tasks.withType<Test> {
    useJUnitPlatform()
    finalizedBy(tasks.jacocoTestReport)
}

tasks.jacocoTestReport {
    dependsOn(tasks.test)
    reports {
        html.required.set(true)
        xml.required.set(true)
        csv.required.set(false)
    }
}

tasks.jacocoTestCoverageVerification {
    dependsOn(tasks.test)
    violationRules {
        rule {
            limit {
                counter = "INSTRUCTION"
                minimum = "0.80".toBigDecimal()
            }
        }
    }
}

tasks.check {
    dependsOn(tasks.jacocoTestCoverageVerification)
}
